import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Reservation from '@/models/Reservation';
import SensorOccupancy from '@/models/SensorOccupancy';
import { getRestaurantTables, isTableCapacityAllowed } from '@/lib/tables';

type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed";

const ACTIVE_STATUSES = ["pending", "confirmed"];

async function findAvailableTable({
  restaurantId,
  persons,
  date,
  time,
  excludeReservationId,
}: {
  restaurantId: string;
  persons: number;
  date: string;
  time: string;
  excludeReservationId?: string;
}) {
  const restaurantTables = getRestaurantTables(restaurantId)
    .filter((table) => isTableCapacityAllowed(persons, table.capacity))
    .sort((a, b) => a.capacity - b.capacity || a.tableId - b.tableId);

  if (!restaurantTables.length) return null;

  const activeReservations = await Reservation.find({
    restaurantId,
    date,
    time,
    status: { $in: ACTIVE_STATUSES },
    ...(excludeReservationId ? { _id: { $ne: excludeReservationId } } : {}),
  });
  const reservedTableIds = new Set(activeReservations.map((reservation) => reservation.tableId));

  const occupiedSensorTables = await SensorOccupancy.find({
    restaurantId,
    isOccupied: true,
  });
  const occupiedTableIds = new Set(occupiedSensorTables.map((table) => table.tableId));

  return restaurantTables.find(
    (table) => !reservedTableIds.has(table.tableId) && !occupiedTableIds.has(table.tableId)
  ) || null;
}

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const userId = searchParams.get("userId");
    const filter = {
      ...(restaurantId ? { restaurantId } : {}),
      ...(userId ? { userId } : {}),
    };
    const reservations = await Reservation.find(filter).sort({ date: 1, time: 1, createdAt: -1 });

    return NextResponse.json(reservations);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Не вдалося завантажити бронювання";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const requiredFields = ["restaurantId", "restaurantName", "clientName", "clientPhone", "persons", "date", "time", "duration"];
    const missingField = requiredFields.find((field) => !body[field]);

    if (missingField) {
      return NextResponse.json({
        ok: false,
        error: "Заповніть усі поля бронювання",
      }, { status: 400 });
    }

    const personsCount = Number(body.persons);
    if (!Number.isFinite(personsCount)) {
      return NextResponse.json({
        ok: false,
        error: "Вкажіть коректну кількість гостей",
      }, { status: 400 });
    }

    const availableTable = await findAvailableTable({
      restaurantId: body.restaurantId,
      persons: personsCount,
      date: body.date,
      time: body.time,
    });
    if (!availableTable) {
      return NextResponse.json({
        ok: false,
        error: "Недоступно: усі столи потрібної місткості зайняті або заброньовані.",
      }, { status: 409 });
    }

    const newReservation = await Reservation.create({
      ...body,
      tableId: availableTable.tableId,
      tableCapacity: availableTable.capacity,
      status: "pending",
    });

    return NextResponse.json(newReservation, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Не вдалося створити бронювання";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { id, status, userId, persons, date, time, duration, clientName, clientPhone } = body;
    const allowedStatuses: ReservationStatus[] = ["pending", "confirmed", "cancelled", "completed"];

    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json({ ok: false, error: "Невідомий статус" }, { status: 400 });
    }

    const currentReservation = await Reservation.findById(id);

    if (!currentReservation) {
      return NextResponse.json({ ok: false, error: "Бронювання не знайдено" }, { status: 404 });
    }

    if (userId && currentReservation.userId && currentReservation.userId !== userId) {
      return NextResponse.json({ ok: false, error: "Це бронювання належить іншому користувачу" }, { status: 403 });
    }

    const nextPersons = persons ?? currentReservation.persons;
    const nextDate = date ?? currentReservation.date;
    const nextTime = time ?? currentReservation.time;
    const update: Record<string, unknown> = {
      ...(status ? { status } : {}),
      ...(duration ? { duration } : {}),
      ...(clientName ? { clientName } : {}),
      ...(clientPhone ? { clientPhone } : {}),
      ...(persons ? { persons } : {}),
      ...(date ? { date } : {}),
      ...(time ? { time } : {}),
    };

    const needsNewTable = Boolean(persons || date || time);
    if (needsNewTable && status !== 'cancelled') {
      const availableTable = await findAvailableTable({
        restaurantId: currentReservation.restaurantId,
        persons: Number(nextPersons),
        date: nextDate,
        time: nextTime,
        excludeReservationId: id,
      });

      if (!availableTable) {
        return NextResponse.json({
          ok: false,
          error: "Недоступно: немає вільного столу для оновлених параметрів.",
        }, { status: 409 });
      }

      update.tableId = availableTable.tableId;
      update.tableCapacity = availableTable.capacity;
    }

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    );

    return NextResponse.json(reservation);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Не вдалося оновити бронювання";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { id } = await req.json();
    const reservation = await Reservation.findByIdAndDelete(id);

    if (!reservation) {
      return NextResponse.json({ ok: false, error: "Бронювання не знайдено" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Не вдалося видалити бронювання";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
