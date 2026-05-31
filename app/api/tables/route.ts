import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SensorOccupancy from '@/models/SensorOccupancy';
import { RESTAURANT_TABLES } from '@/lib/tables';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const filter = restaurantId ? { restaurantId } : {};
    const sensorStates = await SensorOccupancy.find(filter).sort({ restaurantId: 1, tableId: 1 });
    const stateByKey = new Map(
      sensorStates.map((state) => [`${state.restaurantId}:${state.tableId}`, state])
    );

    const inventory = RESTAURANT_TABLES
      .filter((table) => !restaurantId || table.restaurantId === restaurantId)
      .map((table) => {
        const sensorState = stateByKey.get(`${table.restaurantId}:${table.tableId}`);
        return {
          id: sensorState?.id || `${table.restaurantId}-${table.tableId}`,
          restaurantId: table.restaurantId,
          tableId: table.tableId,
          capacity: sensorState?.capacity || table.capacity,
          hasSensor: Boolean(table.hasSensor),
          isOccupied: Boolean(sensorState?.isOccupied),
          updatedAt: sensorState?.updatedAt,
        };
      });

    const customSensorTables = sensorStates
      .filter((state) => !RESTAURANT_TABLES.some((table) => table.restaurantId === state.restaurantId && table.tableId === state.tableId))
      .map((state) => ({
        id: state.id,
        restaurantId: state.restaurantId,
        tableId: state.tableId,
        capacity: state.capacity,
        hasSensor: true,
        isOccupied: state.isOccupied,
        updatedAt: state.updatedAt,
      }));

    return NextResponse.json([...inventory, ...customSensorTables]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Не вдалося завантажити статуси столиків";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
