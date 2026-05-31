import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import SensorOccupancy from '@/models/SensorOccupancy';
import Reservation from '@/models/Reservation';

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
    // 1. Підключаємося до MongoDB Atlas
    await dbConnect();

    // 2. Зчитуємо дані від Wokwi
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

    // 3. Зберігаємо в базу (оновлюємо або створюємо новий)
    const updatedTable = await SensorOccupancy.findOneAndUpdate(
      { restaurantId: resolvedRestaurantId, tableId: resolvedTableId },
      { 
        $set: { 
          restaurantId: resolvedRestaurantId,
          tableId: resolvedTableId,
          isOccupied,
          ...(capacity ? { capacity: Number(capacity) } : {}),
        } 
      },
      { 
        new: true,     // Повернути оновлений документ
        upsert: true   // СТВОРИТИ запис, якщо столика №1 ще немає в базі!
      }
    );

    if (!isOccupied) {
      await Reservation.updateMany(
        {
          restaurantId: resolvedRestaurantId,
          date: getTodayString(),
          status: { $in: ["pending", "confirmed"] },
        },
        { $set: { status: "completed" } }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `Стіл №${updatedTable.tableId} збережено! Зайнятий: ${updatedTable.isOccupied}` 
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Помилка збереження в MongoDB:", error);
    const message = error instanceof Error ? error.message : "Невідома помилка";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
