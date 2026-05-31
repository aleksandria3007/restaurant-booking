import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, phone, email } = body;

    if (!name || !phone) {
      return NextResponse.json({ ok: false, error: "Вкажіть ім'я та телефон" }, { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      { phone },
      { $set: { name, phone, email: email || "" } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json(user, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Не вдалося зберегти користувача";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await dbConnect();
    const { id, name, phone, email } = await req.json();

    if (!id || !name || !phone) {
      return NextResponse.json({ ok: false, error: "Вкажіть ім'я та телефон" }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { name, phone, email: email || "" } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ ok: false, error: "Користувача не знайдено" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Не вдалося оновити користувача";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
