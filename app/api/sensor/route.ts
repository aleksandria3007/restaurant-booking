import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Table from '@/models/Table';

export async function POST(request: Request) {
  try {
    // 1. Підключаємося до MongoDB Atlas
    await dbConnect();

    // 2. Зчитуємо дані від Wokwi
    const body = await request.json();
    const { tableId, isOccupied } = body;

    // 3. Зберігаємо в базу (оновлюємо або створюємо новий)
    const updatedTable = await Table.findOneAndUpdate(
      { number: tableId }, // Шукаємо стіл за номером
      { 
        $set: { 
          number: tableId,
          isAvailable: !isOccupied // Якщо зайнятий (true) -> доступність (false)
        } 
      },
      { 
        new: true,     // Повернути оновлений документ
        upsert: true   // СТВОРИТИ запис, якщо столика №1 ще немає в базі!
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: `Стіл №${tableId} збережено! Доступність: ${updatedTable.isAvailable}` 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Помилка збереження в MongoDB:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}