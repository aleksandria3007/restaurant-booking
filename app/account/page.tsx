"use client";

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

type CurrentUser = {
  id: string;
  _id?: string;
  name: string;
  phone: string;
  email?: string;
};

type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

type Reservation = {
  id: string;
  restaurantName: string;
  clientName: string;
  clientPhone: string;
  persons: string;
  date: string;
  time: string;
  duration: string;
  tableId: number;
  tableCapacity: number;
  status: ReservationStatus;
};

const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'Очікує',
  confirmed: 'Підтверджено',
  cancelled: 'Скасовано',
  completed: 'Завершено',
};

export default function AccountPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [editingId, setEditingId] = useState("");
  const [editPersons, setEditPersons] = useState("2");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  const loadReservations = useCallback(async (userId: string) => {
    const response = await fetch(`/api/health?userId=${userId}`, { cache: 'no-store' });
    const data = await response.json();
    setReservations(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const savedUser = window.localStorage.getItem('reserraUser');
      if (!savedUser) {
        setIsReady(true);
        return;
      }

      const parsedUser = JSON.parse(savedUser) as CurrentUser;
      const normalizedUser = { ...parsedUser, id: parsedUser.id || parsedUser._id || "" };
      setUser(normalizedUser);
      setIsReady(true);
      if (normalizedUser.id) {
        loadReservations(normalizedUser.id);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [loadReservations]);

  const startEdit = (reservation: Reservation) => {
    setEditingId(reservation.id);
    setEditPersons(reservation.persons);
    setEditDate(reservation.date);
    setEditTime(reservation.time);
  };

  const updateReservation = async (reservation: Reservation) => {
    if (!user) return;

    const response = await fetch('/api/health', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: reservation.id,
        userId: user.id,
        persons: editPersons,
        date: editDate,
        time: editTime,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      alert(data?.error || 'Не вдалося оновити бронювання');
      return;
    }

    setEditingId("");
    await loadReservations(user.id);
  };

  const cancelReservation = async (reservation: Reservation) => {
    if (!user) return;

    const response = await fetch('/api/health', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reservation.id, userId: user.id, status: 'cancelled' }),
    });

    if (response.ok) {
      await loadReservations(user.id);
    }
  };

  if (!isReady) {
    return <div className="min-h-screen bg-gray-50 text-gray-900" />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 text-gray-900">
        <div className="mx-auto max-w-3xl rounded-lg border bg-white p-8 text-center">
          <h1 className="text-2xl font-bold">Увійдіть на головній сторінці</h1>
          <p className="mt-2 text-gray-600">Після реєстрації тут зʼявляться ваші бронювання.</p>
          <Link href="/" className="mt-5 inline-flex rounded-lg bg-amber-600 px-5 py-3 font-bold text-white">
            На головну
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-amber-700">Reserra</Link>
          <span className="text-sm font-semibold text-gray-500">{user.name}</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold">Мої бронювання</h1>
        <div className="mt-6 space-y-4">
          {reservations.length === 0 ? (
            <div className="rounded-lg border bg-white p-8 text-center text-gray-500">Бронювань поки немає.</div>
          ) : reservations.map((reservation) => (
            <div key={reservation.id} className="rounded-lg border bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-bold">{reservation.restaurantName}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Стіл №{reservation.tableId}, до {reservation.tableCapacity} ос. · {STATUS_LABELS[reservation.status]}
                  </p>
                </div>
                {reservation.status !== 'cancelled' && reservation.status !== 'completed' && (
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(reservation)} className="rounded-md border px-3 py-2 text-sm font-semibold hover:bg-gray-50">
                      Редагувати
                    </button>
                    <button onClick={() => cancelReservation(reservation)} className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">
                      Скасувати
                    </button>
                  </div>
                )}
              </div>

              {editingId === reservation.id ? (
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <select value={editPersons} onChange={(e) => setEditPersons(e.target.value)} className="rounded-lg border p-2.5">
                    {[1, 2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>{value} ос.</option>)}
                  </select>
                  <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="rounded-lg border p-2.5" />
                  <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} className="rounded-lg border p-2.5" />
                  <button onClick={() => updateReservation(reservation)} className="rounded-lg bg-amber-600 px-4 py-2.5 font-bold text-white hover:bg-amber-700">
                    Зберегти
                  </button>
                </div>
              ) : (
                <p className="mt-4 text-gray-700">
                  {reservation.date} о {reservation.time}, {reservation.persons} ос., тривалість {reservation.duration} год.
                </p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
