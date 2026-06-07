import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SensorOccupancy from '@/models/SensorOccupancy';
import Reservation from '@/models/Reservation';

// Скільки хвилин тримати стіл "зайнятим" після того, як датчик надіслав "вільний"
const GRACE_PERIOD_MS = 15 * 60 * 1000; // 15 хвилин

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

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { restaurantId, tableId, isOccupied, capacity } = body;

    if (!tableId || typeof isOccupied !== "boolean") {
      return NextResponse.json({
        success: false,
        error: "Потрібні поля tableId та isOccupied",
      }, { status: 400 });
    }

    const resolvedRestaurantId = String(restaurantId || tableId);
    const resolvedTableId = Number(tableId);

    if (!Number.isFinite(resolvedTableId)) {
      return NextResponse.json({
        success: false,
        error: "tableId має бути числом",
      }, { status: 400 });
    }

    if (isOccupied) {
      // Хтось сів — негайно позначаємо зайнятим, скасовуємо будь-який grace-period
      const updatedTable = await SensorOccupancy.findOneAndUpdate(
        { restaurantId: resolvedRestaurantId, tableId: resolvedTableId },
        {
          $set: {
            restaurantId: resolvedRestaurantId,
            tableId: resolvedTableId,
            isOccupied: true,
            freeAt: null,
            ...(capacity ? { capacity: Number(capacity) } : {}),
          }
        },
        { new: true, upsert: true }
      );

      return NextResponse.json({
        success: true,
        message: `Стіл №${updatedTable.tableId} зайнятий`,
      }, { status: 200 });

    } else {
      // Датчик не фіксує рух — запускаємо grace-period 15 хв.
      // Стіл лишається "зайнятим" ще 15 хв на випадок, якщо людина просто відійшла.
      const freeAt = new Date(Date.now() + GRACE_PERIOD_MS);

      const existing = await SensorOccupancy.findOne({
        restaurantId: resolvedRestaurantId,
        tableId: resolvedTableId,
      });

      if (!existing) {
        // Стіл і так вважався вільним — нічого не робимо
        return NextResponse.json({
          success: true,
          message: `Стіл №${resolvedTableId} і так вільний`,
        }, { status: 200 });
      }

      if (existing.freeAt) {
        // Grace-period вже запущений раніше — не оновлюємо, щоб не продовжувати час
        return NextResponse.json({
          success: true,
          message: `Стіл №${resolvedTableId}: grace-period вже активний до ${existing.freeAt.toISOString()}`,
        }, { status: 200 });
      }

      // Запускаємо новий grace-period
      await SensorOccupancy.findOneAndUpdate(
        { restaurantId: resolvedRestaurantId, tableId: resolvedTableId },
        { $set: { freeAt } }
        // isOccupied лишається true — стіл поки що "зайнятий"
      );

      return NextResponse.json({
        success: true,
        message: `Стіл №${resolvedTableId}: розпочато grace-period 15 хв. Вільним стане о ${freeAt.toLocaleTimeString('uk-UA')}`,
      }, { status: 200 });
    }

  } catch (error: unknown) {
    console.error("Помилка збереження в MongoDB:", error);
    const message = error instanceof Error ? error.message : "Невідома помилка";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
