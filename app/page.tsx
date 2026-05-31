"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { RESTAURANTS, type Restaurant } from '@/lib/restaurants';
import { RESTAURANT_TABLES, isTableCapacityAllowed } from '@/lib/tables';

const generateTimes = () => {
  const times = [];
  for (let h = 10; h <= 22; h++) {
    for (let m = 0; m < 60; m += 15) {
      if (h === 22 && m > 0) break;
      const hour = String(h).padStart(2, '0');
      const minute = String(m).padStart(2, '0');
      times.push(`${hour}:${minute}`);
    }
  }
  return times;
};

const ALL_TIMES = generateTimes();

type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed";
type Reservation = {
  id?: string;
  restaurantId?: string;
  tableId?: number;
  date?: string;
  time?: string;
  status?: ReservationStatus;
};
type TableState = {
  tableId: number;
  restaurantId: string;
  isOccupied: boolean;
  capacity?: number;
};
type CurrentUser = {
  id: string;
  _id?: string;
  name: string;
  phone: string;
  email?: string;
};

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getAvailableTimes = (date: string) => {
  const today = getTodayString();
  if (date !== today) return ALL_TIMES;

  const now = new Date();
  return ALL_TIMES.filter(t => {
    const [h, m] = t.split(':').map(Number);
    return h > now.getHours() || (h === now.getHours() && m > now.getMinutes());
  });
};

const getCounts = (items: Restaurant[], field: 'type' | 'cuisine') => {
  return Array.from(
    items.reduce((counts, restaurant) => {
      const key = restaurant[field];
      counts.set(key, (counts.get(key) ?? 0) + 1);
      return counts;
    }, new Map<string, number>())
  )
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => a.label.localeCompare(b.label, 'uk'));
};

export default function HomePage() {
  const [persons, setPersons] = useState("2");
  const [date, setDate] = useState(() => getTodayString());
  const [time, setTime] = useState("");
  const [city, setCity] = useState("Львів");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [duration, setDuration] = useState("2");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [tableStates, setTableStates] = useState<TableState[]>([]);
  const [syncError, setSyncError] = useState("");

  const loadRealtimeState = useCallback(async () => {
    try {
      const [reservationsResponse, tablesResponse] = await Promise.all([
        fetch('/api/health', { cache: 'no-store' }),
        fetch('/api/tables', { cache: 'no-store' }),
      ]);

      if (!reservationsResponse.ok || !tablesResponse.ok) {
        throw new Error("Не вдалося оновити актуальні статуси");
      }

      const [reservationsData, tablesData] = await Promise.all([
        reservationsResponse.json(),
        tablesResponse.json(),
      ]);

      setReservations(Array.isArray(reservationsData) ? reservationsData : []);
      setTableStates(Array.isArray(tablesData) ? tablesData : []);
      setSyncError("");
    } catch {
      setSyncError("Не вдалося оновити статуси в реальному часі");
    }
  }, []);

  const toggleType = (label: string) => {
    setSelectedTypes(prev => prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label]);
  };

  const toggleCuisine = (label: string) => {
    setSelectedCuisines(prev => prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label]);
  };

  const handleCityChange = (nextCity: string) => {
    setCity(nextCity);
    setSearchQuery("");
    setSelectedTypes([]);
    setSelectedCuisines([]);
  };

  const openBooking = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    if (currentUser) {
      setClientName(currentUser.name);
      setClientPhone(currentUser.phone);
    }
    setIsModalOpen(true);
  };

  const cityRestaurants = useMemo(
    () => RESTAURANTS.filter(restaurant => restaurant.city === city),
    [city]
  );
  const placeTypes = useMemo(() => getCounts(cityRestaurants, 'type'), [cityRestaurants]);
  const cuisineTypes = useMemo(() => getCounts(cityRestaurants, 'cuisine'), [cityRestaurants]);

  const availableTimes = useMemo(() => getAvailableTimes(date), [date]);
  const selectedTime = availableTimes.includes(time) ? time : availableTimes[0] ?? "";
  const selectedPersons = Number(persons);

  const reservedTableKeys = useMemo(() => new Set(
    reservations
      .filter((reservation) => (
        reservation.date === date &&
        reservation.time === selectedTime &&
        typeof reservation.tableId === 'number' &&
        (reservation.status === 'pending' || reservation.status === 'confirmed')
      ))
      .map((reservation) => `${reservation.restaurantId}:${reservation.tableId}`)
  ), [date, reservations, selectedTime]);

  const occupiedTableKeys = useMemo(() => new Set(
    tableStates
      .filter((table) => table.isOccupied)
      .map((table) => `${table.restaurantId}:${table.tableId}`)
  ), [tableStates]);

  const tablesByRestaurant = useMemo(() => {
    const grouped = new Map<string, TableState[]>();

    RESTAURANT_TABLES.forEach((table) => {
      const state = tableStates.find((item) => item.restaurantId === table.restaurantId && item.tableId === table.tableId);
      const tables = grouped.get(table.restaurantId) ?? [];
      tables.push({
        restaurantId: table.restaurantId,
        tableId: table.tableId,
        capacity: state?.capacity || table.capacity,
        isOccupied: Boolean(state?.isOccupied),
      });
      grouped.set(table.restaurantId, tables);
    });

    tableStates.forEach((table) => {
      if (!RESTAURANT_TABLES.some((item) => item.restaurantId === table.restaurantId && item.tableId === table.tableId)) {
        const tables = grouped.get(table.restaurantId) ?? [];
        tables.push(table);
        grouped.set(table.restaurantId, tables);
      }
    });

    return grouped;
  }, [tableStates]);

  const isRestaurantAvailable = useCallback((restaurant: Restaurant) => {
    const restaurantTables = tablesByRestaurant.get(restaurant.id) ?? [{
      restaurantId: restaurant.id,
      tableId: Number(restaurant.id) || 1,
      capacity: restaurant.capacity,
      isOccupied: !restaurant.isAvailable,
    }];

    return restaurantTables.some((table) => (
      isTableCapacityAllowed(selectedPersons, table.capacity || restaurant.capacity) &&
      !occupiedTableKeys.has(`${restaurant.id}:${table.tableId}`) &&
      !reservedTableKeys.has(`${restaurant.id}:${table.tableId}`)
    ));
  }, [occupiedTableKeys, reservedTableKeys, selectedPersons, tablesByRestaurant]);

  useEffect(() => {
    const savedUser = window.localStorage.getItem('reserraUser');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser) as CurrentUser;
      const normalizedUser = { ...parsedUser, id: parsedUser.id || parsedUser._id || "" };
      setCurrentUser(normalizedUser);
      setAuthName(parsedUser.name);
      setAuthPhone(parsedUser.phone);
      setAuthEmail(parsedUser.email || "");
    }

    loadRealtimeState();
    const interval = window.setInterval(loadRealtimeState, 5000);
    const handleFocus = () => loadRealtimeState();

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [loadRealtimeState]);

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: authName, phone: authPhone, email: authEmail }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      alert(data?.error || 'Не вдалося зберегти користувача');
      return;
    }

    const savedUser = await response.json();
    const user = { ...savedUser, id: savedUser.id || savedUser._id || "" };
    setCurrentUser(user);
    setClientName(user.name);
    setClientPhone(user.phone);
    window.localStorage.setItem('reserraUser', JSON.stringify(user));
    setIsAuthOpen(false);
  };

  const filteredRestaurants = cityRestaurants.filter(restaurant => {
    const matchType = selectedTypes.length === 0 || selectedTypes.includes(restaurant.type);
    const matchCuisine = selectedCuisines.length === 0 || selectedCuisines.includes(restaurant.cuisine);
    const matchSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCapacity = restaurant.capacity >= selectedPersons;
    return matchType && matchCuisine && matchSearch && matchCapacity;
  });

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return;

    const response = await fetch('/api/health', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId: selectedRestaurant.id,
        restaurantName: selectedRestaurant.name,
        clientName,
        clientPhone,
        persons,
        date,
        time: selectedTime,
        duration,
        userId: currentUser?.id,
      }),
    });

    if (response.ok) {
      alert(`Бронювання успішне для ${clientName} у ${selectedRestaurant.name}`);
      setClientName("");
      setClientPhone("");
      setDuration("2");
      setIsModalOpen(false);
      await loadRealtimeState();
      return;
    }

    const data = await response.json().catch(() => null);
    alert(data?.error || 'Не вдалося створити бронювання. Спробуйте ще раз.');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-12 relative">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6 flex-1">
            <div className="text-2xl font-bold text-amber-700 tracking-tighter">Reserra</div>
            <select value={city} onChange={(e) => handleCityChange(e.target.value)} className="bg-white border rounded p-1.5 text-sm cursor-pointer">
              <option value="Львів">Львів</option>
              <option value="Запоріжжя">Запоріжжя</option>
              <option value="Київ">Київ</option>
            </select>
            <input type="text" placeholder="Пошук..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="hidden md:block border rounded py-1.5 px-3 text-sm max-w-sm w-full" />
          </div>
          <div className="flex items-center gap-2">
            {currentUser ? (
              <Link href="/account" className="rounded border px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50">
                Мої бронювання
              </Link>
            ) : (
              <button onClick={() => setIsAuthOpen(true)} className="rounded border px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50">
                Увійти
              </button>
            )}
            <Link href="/admin" className="bg-amber-600 text-white px-4 py-2 rounded text-sm font-bold">Адмін</Link>
          </div>
        </div>
      </header>

      <div className="bg-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="bg-white p-2 rounded-lg flex-1">
            <label className="text-[10px] uppercase font-bold text-gray-400 block ml-1">Для</label>
            <select value={persons} onChange={(e) => setPersons(e.target.value)} className="w-full p-1 focus:outline-none">
              <option value="2">2-ох людей</option>
              <option value="4">4-ох людей</option>
              <option value="6">6-ти людей</option>
            </select>
          </div>
          <div className="bg-white p-2 rounded-lg flex-1">
            <label className="text-[10px] uppercase font-bold text-gray-400 block ml-1">Дата</label>
            <input type="date" value={date} min={getTodayString()} onChange={(e) => setDate(e.target.value)} className="w-full p-1 focus:outline-none" />
          </div>
          <div className="bg-white p-2 rounded-lg flex-1">
            <label className="text-[10px] uppercase font-bold text-gray-400 block ml-1">Час</label>
            <select value={selectedTime} onChange={(e) => setTime(e.target.value)} disabled={availableTimes.length === 0} className="w-full p-1 focus:outline-none disabled:text-gray-300">
              {availableTimes.length > 0 ? availableTimes.map(t => <option key={t} value={t}>{t}</option>) : <option>Немає часу</option>}
            </select>
          </div>
          <button className="bg-amber-600 text-white font-bold py-3 rounded-lg hover:bg-amber-700 transition-colors uppercase text-sm">Підібрати</button>
        </div>
      </div>

      {syncError && (
        <div className="bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700">
          {syncError}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <h2 className="font-bold text-lg uppercase mb-4">Параметри:</h2>
          <div className="bg-white border rounded shadow-sm p-4">
            <h3 className="font-bold mb-3 border-b pb-2">Тип закладу:</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {placeTypes.map(type => (
                <label key={type.label} className="flex items-center gap-3 cursor-pointer hover:text-amber-700 transition-colors">
                  <input type="checkbox" checked={selectedTypes.includes(type.label)} onChange={() => toggleType(type.label)} className="w-4 h-4 accent-amber-600" />
                  <span className="text-sm">{type.label} <span className="text-gray-400">({type.count})</span></span>
                </label>
              ))}
            </div>

            <h3 className="font-bold mt-6 mb-3 border-b pb-2">Кухня:</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {cuisineTypes.map(cuisine => (
                <label key={cuisine.label} className="flex items-center gap-3 cursor-pointer hover:text-amber-700 transition-colors">
                  <input type="checkbox" checked={selectedCuisines.includes(cuisine.label)} onChange={() => toggleCuisine(cuisine.label)} className="w-4 h-4 accent-amber-600" />
                  <span className="text-sm">{cuisine.label} <span className="text-gray-400">({cuisine.count})</span></span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-6">Каталог закладів</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => {
              const isAvailable = isRestaurantAvailable(restaurant);
              return (
                <div key={restaurant.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group border-gray-100">
                  <Link href={`/booking/${restaurant.id}`} className="flex-1">
                    <div className="h-48 overflow-hidden relative">
                      <img src={restaurant.img} alt={restaurant.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      {!isAvailable && <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-bold text-white uppercase tracking-widest">Зайнято</div>}
                    </div>
                    <div className="p-4">
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{restaurant.type} · {restaurant.cuisine}</span>
                      <h3 className="text-lg font-bold mb-1 leading-tight group-hover:text-amber-700 transition-colors">{restaurant.name}</h3>
                      <div className="flex items-start gap-1 text-xs text-gray-500 font-medium">
                        <svg className="w-3.5 h-3.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        {restaurant.location}
                      </div>
                      <div className="mt-3 text-sm font-bold text-gray-800">
                        Середній чек: {restaurant.averageCheck} грн
                      </div>
                    </div>
                  </Link>
                  <div className="p-4 pt-0">
                    <button onClick={() => openBooking(restaurant)} disabled={!isAvailable} className="w-full py-2.5 bg-amber-50 text-amber-800 rounded-lg font-bold hover:bg-amber-100 transition-colors disabled:bg-gray-100 disabled:text-gray-400">
                      {isAvailable ? 'Забронювати стіл' : 'Недоступно'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {isModalOpen && selectedRestaurant && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold">Бронювання</h2>
                <p className="text-xs text-gray-500 font-medium">{selectedRestaurant.name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
              {!currentUser && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
                  Для перегляду, редагування і скасування бронювання зареєструйтесь через кнопку “Увійти”.
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Ваше ім&apos;я</label>
                  <input required type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full border rounded-lg p-2.5 focus:ring-2 ring-amber-500 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Телефон</label>
                  <input required type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="w-full border rounded-lg p-2.5 focus:ring-2 ring-amber-500 focus:outline-none" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Кількість осіб</label>
                  <select value={persons} onChange={(e) => setPersons(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm">
                    {[1,2,3,4,5,6].map(v => <option key={v} value={v}>{v} ос.</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Дата</label>
                  <input type="date" value={date} min={getTodayString()} onChange={(e) => setDate(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Час</label>
                  <select value={selectedTime} onChange={(e) => setTime(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm">
                    {availableTimes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Тривалість</label>
                  <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm">
                    {[1,2,3,4].map(v => <option key={v} value={v}>{v} {v === 1 ? 'година' : 'години'}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={!isRestaurantAvailable(selectedRestaurant)} className="w-full py-3.5 bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-600/30 hover:bg-amber-700 transition-all uppercase text-sm tracking-widest mt-4 disabled:bg-gray-300 disabled:shadow-none">
                {isRestaurantAvailable(selectedRestaurant) ? 'Підтвердити резерв' : 'Недоступно для вибраної кількості гостей'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isAuthOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form onSubmit={saveUser} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">Реєстрація</h2>
              <button type="button" onClick={() => setIsAuthOpen(false)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="space-y-4">
              <input required value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="Ім'я" className="w-full rounded-lg border p-3" />
              <input required value={authPhone} onChange={(e) => setAuthPhone(e.target.value)} placeholder="Телефон" className="w-full rounded-lg border p-3" />
              <input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border p-3" />
              <button type="submit" className="w-full rounded-lg bg-amber-600 py-3 font-bold text-white hover:bg-amber-700">
                Зберегти
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
