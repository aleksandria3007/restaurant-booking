import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRestaurantById } from '@/lib/restaurants';
import RestaurantReviews from './reviews';

export default async function RestaurantDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const restaurant = getRestaurantById(id);

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-12">
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-amber-700 hover:opacity-80">
            Reserra
          </Link>
          <Link href="/" className="rounded-md border px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            До каталогу
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="h-[280px] bg-gray-100 sm:h-[420px]">
            <img src={restaurant.img} alt={restaurant.name} className="h-full w-full object-cover" />
          </div>

          <div className="grid gap-8 p-6 lg:grid-cols-[1fr_280px] lg:p-8">
            <section>
              <div className="mb-2 text-sm font-bold uppercase tracking-wide text-amber-700">
                {restaurant.type} · {restaurant.cuisine}
              </div>
              <h1 className="text-3xl font-extrabold text-gray-950 sm:text-4xl">{restaurant.name}</h1>
              <p className="mt-3 text-gray-600">{restaurant.city}, {restaurant.location}</p>

              <h2 className="mt-8 text-2xl font-bold text-gray-950">Про заклад</h2>
              <p className="mt-3 text-lg leading-relaxed text-gray-700">{restaurant.description}</p>

              <h2 className="mt-8 text-2xl font-bold text-gray-950">Кухня</h2>
              <p className="mt-3 leading-relaxed text-gray-700">
                Основний напрям кухні: <span className="font-semibold">{restaurant.cuisine}</span>. Заклад підходить
                для компаній до {restaurant.capacity} осіб за одним бронюванням.
              </p>
            </section>

            <aside className="h-fit rounded-lg border border-gray-200 bg-gray-50 p-5">
              <div className="text-sm font-semibold text-gray-500">Тип закладу</div>
              <div className="mt-1 text-lg font-bold text-gray-950">{restaurant.type}</div>

              <div className="mt-5 text-sm font-semibold text-gray-500">Кухня</div>
              <div className="mt-1 text-lg font-bold text-gray-950">{restaurant.cuisine}</div>

              <div className="mt-5 text-sm font-semibold text-gray-500">Місткість</div>
              <div className="mt-1 text-lg font-bold text-gray-950">до {restaurant.capacity} осіб</div>

              <div className="mt-5 text-sm font-semibold text-gray-500">Середній чек</div>
              <div className="mt-1 text-lg font-bold text-gray-950">{restaurant.averageCheck} грн</div>

              <Link
                href="/"
                className="mt-6 flex w-full items-center justify-center rounded-lg bg-amber-600 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-amber-700"
              >
                Забронювати з каталогу
              </Link>
            </aside>
          </div>
        </div>

        <section className="mt-8 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="border-b p-5">
            <h2 className="text-2xl font-bold text-gray-950">На карті</h2>
            <p className="mt-1 text-sm text-gray-500">{restaurant.city}, {restaurant.location}</p>
          </div>
          <iframe
            title={`Карта: ${restaurant.name}`}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${restaurant.lng - 0.004}%2C${restaurant.lat - 0.003}%2C${restaurant.lng + 0.004}%2C${restaurant.lat + 0.003}&layer=mapnik&marker=${restaurant.lat}%2C${restaurant.lng}`}
            className="h-80 w-full border-0"
          />
        </section>

        <RestaurantReviews restaurantId={restaurant.id} />
      </main>
    </div>
  );
}
