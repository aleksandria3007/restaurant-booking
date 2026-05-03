let reservations: any[] = [];

export async function GET() {
  return Response.json(reservations);
}

export async function POST(req: Request) {
  const body = await req.json();

  const newReservation = {
    id: Date.now(),
    ...body,
    status: "active",
    createdAt: new Date()
  };

  reservations.push(newReservation);

  return Response.json(newReservation);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  reservations = reservations.filter(r => r.id !== id);

  return Response.json({ ok: true });
}