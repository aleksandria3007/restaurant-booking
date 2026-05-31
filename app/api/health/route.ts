import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Reservation from '@/models/Reservation';
import Table from '@/models/Table';

type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const filter = restaurantId ? { restaurantId } : {};
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

    const tableNumber = Number(body.restaurantId);
    const physicalTable = Number.isFinite(tableNumber)
      ? await Table.findOne({ number: tableNumber })
      : null;

    if (physicalTable && !physicalTable.isAvailable) {
      return NextResponse.json({
        ok: false,
        error: "Вибачте, цей столик щойно був зайнятий. Оберіть інший заклад або час.",
      }, { status: 409 });
    }

    const existingReservation = await Reservation.findOne({
      restaurantId: body.restaurantId,
      date: body.date,
      time: body.time,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingReservation) {
      return NextResponse.json({
        ok: false,
        error: "На цей час уже є активне бронювання. Оберіть інший слот.",
      }, { status: 409 });
    }

    const newReservation = await Reservation.create({
      ...body,
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
    const { id, status } = await req.json();
    const allowedStatuses: ReservationStatus[] = ["pending", "confirmed", "cancelled", "completed"];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ ok: false, error: "Невідомий статус" }, { status: 400 });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

    if (!reservation) {
      return NextResponse.json({ ok: false, error: "Бронювання не знайдено" }, { status: 404 });
    }

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
