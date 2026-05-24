import { NextResponse } from 'next/server';

// Коли ви повністю підключите MongoDB, розкоментуйте ці рядки для роботи з базою:
// import { connectToDatabase } from '@/lib/mongodb'; 
// import Table from '@/models/Table';

export async function POST(request: Request) {
  try {
    // Зчитуємо дані, які прислав датчик з Wokwi або командного рядка
    const body = await request.json();
    const { tableId, isOccupied } = body;

    // Виводимо лог у консоль сервера Vercel для перевірки
    console.log(`📡 Сигнал від IoT-датчика: Стіл №${tableId} -> ${isOccupied ? 'ЗАЙНЯТИЙ' : 'ВІЛЬНИЙ'}`);

    // ЛОГІКА ДЛЯ БАЗИ ДАНИХ (Розкоментуйте, коли підключите MongoDB):
    /*
    await connectToDatabase();
    // Якщо стіл зайнятий датчиком (isOccupied: true), то його доступність для бронювання стає false
    await Table.updateOne({ number: tableId }, { $set: { isAvailable: !isOccupied } });
    */

    // Повертаємо успішну відповідь (код 200)
    return NextResponse.json({ 
      success: true, 
      message: `Статус столика №${tableId} оновлено. Зайнятість: ${isOccupied}` 
    }, { status: 200 });

  } catch (error) {
    console.error("Помилка в API маршруті датчика:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Некоректні дані або внутрішня помилка сервера" 
    }, { status: 500 });
  }
}