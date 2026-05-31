import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Table from '@/models/Table';
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
    const { tableId, isOccupied } = body;

    if (!tableId || typeof isOccupied !== "boolean") {
      return NextResponse.json({
        success: false,
        error: "Потрібні поля tableId та isOccupied",
      }, { status: 400 });
    }

    // 3. Зберігаємо в базу (оновлюємо або створюємо новий)
    const updatedTable = await Table.findOneAndUpdate(
      { number: tableId }, // Шукаємо стіл за номером
      { 
        $set: { 
          restaurantId: String(tableId),
          number: tableId,
          isAvailable: !isOccupied // Якщо зайнятий (true) -> доступність (false)
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
          restaurantId: String(tableId),
          date: getTodayString(),
          status: { $in: ["pending", "confirmed"] },
        },
        { $set: { status: "completed" } }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: `Стіл №${tableId} збережено! Доступність: ${updatedTable.isAvailable}` 
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Помилка збереження в MongoDB:", error);
    const message = error instanceof Error ? error.message : "Невідома помилка";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
