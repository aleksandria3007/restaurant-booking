import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Review from '@/models/Review';
import User from '@/models/User';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const filter = restaurantId ? { restaurantId } : {};
    const reviews = await Review.find(filter).sort({ createdAt: -1 });

    return NextResponse.json(reviews);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Не вдалося завантажити відгуки";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { restaurantId, userId, rating, text } = body;

    if (!restaurantId || !userId || !rating || !text) {
      return NextResponse.json({ ok: false, error: "Заповніть відгук" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ ok: false, error: "Залишати відгуки можуть лише зареєстровані користувачі" }, { status: 401 });
    }

    const review = await Review.create({
      restaurantId,
      userId,
      userName: user.name,
      rating: Number(rating),
      text,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Не вдалося зберегти відгук";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
