import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Table from '@/models/Table';

export async function GET() {
  try {
    await dbConnect();
    const tables = await Table.find({}).sort({ number: 1 });

    return NextResponse.json(tables);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Не вдалося завантажити статуси столиків";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
