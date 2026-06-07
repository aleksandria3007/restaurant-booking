import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SensorOccupancy from '@/models/SensorOccupancy';
import Reservation from '@/models/Reservation';
import { RESTAURANT_TABLES } from '@/lib/tables';

const getTodayString = () => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Kiev',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now);
};

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const filter = restaurantId ? { restaurantId } : {};
    const now = new Date();

    const sensorStates = await SensorOccupancy.find(filter).sort({ restaurantId: 1, tableId: 1 });

    // Знаходимо записи, у яких grace-period вже закінчився
    const expiredIds: string[] = [];
    for (const state of sensorStates) {
      if (state.freeAt && state.freeAt <= now) {
        expiredIds.push(state._id.toString());
      }
    }

    // Lazily звільняємо прострочені записи
    if (expiredIds.length > 0) {
      const expiredStates = sensorStates.filter((s) => expiredIds.includes(s._id.toString()));

      // Завершуємо резервації для кожного столу, що звільнився
      for (const state of expiredStates) {
        await Reservation.updateMany(
          {
            restaurantId: state.restaurantId,
            tableId: state.tableId,
            date: getTodayString(),
            status: { $in: ['pending', 'confirmed'] },
          },
          { $set: { status: 'completed' } }
        );
      }

      // Видаляємо прострочені записи з БД
      await SensorOccupancy.deleteMany({ _id: { $in: expiredIds } });
    }

    // Актуальні стани (без прострочених)
    const activeStates = sensorStates.filter((s) => !expiredIds.includes(s._id.toString()));

    const stateByKey = new Map(
      activeStates.map((state) => [`${state.restaurantId}:${state.tableId}`, state])
    );

    const inventory = RESTAURANT_TABLES
      .filter((table) => !restaurantId || table.restaurantId === restaurantId)
      .map((table) => {
        const sensorState = stateByKey.get(`${table.restaurantId}:${table.tableId}`);
        const inGracePeriod = sensorState?.freeAt != null;
        return {
          id: sensorState?.id || `${table.restaurantId}-${table.tableId}`,
          restaurantId: table.restaurantId,
          tableId: table.tableId,
          capacity: sensorState?.capacity || table.capacity,
          hasSensor: Boolean(table.hasSensor),
          isOccupied: Boolean(sensorState?.isOccupied),
          // Для UI: якщо активний grace-period — показуємо коли звільниться
          freeAt: inGracePeriod ? sensorState.freeAt : null,
          updatedAt: sensorState?.updatedAt,
        };
      });

    const customSensorTables = activeStates
      .filter((state) => !RESTAURANT_TABLES.some(
        (table) => table.restaurantId === state.restaurantId && table.tableId === state.tableId
      ))
      .map((state) => ({
        id: state.id,
        restaurantId: state.restaurantId,
        tableId: state.tableId,
        capacity: state.capacity,
        hasSensor: true,
        isOccupied: state.isOccupied,
        freeAt: state.freeAt ?? null,
        updatedAt: state.updatedAt,
      }));

    return NextResponse.json([...inventory, ...customSensorTables]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Не вдалося завантажити статуси столиків";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
