import Link from 'next/link';
import { RESTAURANTS } from '@/lib/restaurants';

export default function AdminRestaurantsPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-amber-700">Reserra</Link>
          <span className="text-sm font-semibold text-gray-500">Панель адміністратора</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Оберіть заклад</h1>
          <p className="mt-2 text-gray-600">Кожен заклад має окрему сторінку з власними бронюваннями.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RESTAURANTS.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/admin/${restaurant.id}`}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="h-40 overflow-hidden bg-gray-100">
                <img src={restaurant.img} alt={restaurant.name} className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <div className="mb-1 text-xs font-bold uppercase tracking-wide text-amber-700">{restaurant.type}</div>
                <h2 className="text-lg font-bold leading-tight">{restaurant.name}</h2>
                <p className="mt-2 text-sm text-gray-500">{restaurant.city}, {restaurant.location}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
