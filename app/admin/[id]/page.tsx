import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRestaurantById } from '@/lib/restaurants';
import AdminReservations from './reservations';

export default async function RestaurantAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const restaurant = getRestaurantById(id);

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-amber-700">Reserra</Link>
          <Link href="/admin" className="rounded-md border px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            Усі заклади
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-2 text-sm font-bold uppercase tracking-wide text-amber-700">{restaurant.type}</div>
            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
            <p className="mt-2 text-gray-600">{restaurant.city}, {restaurant.location}</p>
          </div>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <img src={restaurant.img} alt={restaurant.name} className="h-40 w-full object-cover" />
          </div>
        </div>

        <AdminReservations restaurantId={restaurant.id} restaurantName={restaurant.name} />
      </main>
    </div>
  );
}
