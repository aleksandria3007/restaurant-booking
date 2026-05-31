"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';

type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

type Reservation = {
  id: string;
  restaurantId?: string;
  restaurantName?: string;
  clientName?: string;
  clientPhone?: string;
  persons?: string;
  tableId?: number;
  tableCapacity?: number;
  date?: string;
  time?: string;
  duration?: string;
  status: ReservationStatus;
  createdAt?: string;
};

type SensorTable = {
  id: string;
  restaurantId: string;
  tableId: number;
  isOccupied: boolean;
  capacity?: number;
  hasSensor?: boolean;
  updatedAt?: string;
};

type Props = {
  restaurantId: string;
  restaurantName: string;
};

const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'Очікує',
  confirmed: 'Підтверджено',
  cancelled: 'Скасовано',
  completed: 'Завершено',
};

const STATUS_STYLES: Record<ReservationStatus, string> = {
  pending: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  confirmed: 'bg-green-50 text-green-800 border-green-200',
  cancelled: 'bg-red-50 text-red-800 border-red-200',
  completed: 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function AdminReservations({ restaurantId, restaurantName }: Props) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [sensorTables, setSensorTables] = useState<SensorTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | ReservationStatus>('all');

  const loadReservations = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }
    const [reservationsResponse, tablesResponse] = await Promise.all([
      fetch(`/api/health?restaurantId=${restaurantId}`, { cache: 'no-store' }),
      fetch(`/api/tables?restaurantId=${restaurantId}`, { cache: 'no-store' }),
    ]);
    const [reservationsData, tablesData] = await Promise.all([
      reservationsResponse.json(),
      tablesResponse.json(),
    ]);
    setReservations(Array.isArray(reservationsData) ? reservationsData : []);
    setSensorTables(Array.isArray(tablesData) ? tablesData : []);
    setIsLoading(false);
  }, [restaurantId]);

  useEffect(() => {
    let isActive = true;

    const refresh = async (showLoading = true) => {
      if (showLoading) {
        setIsLoading(true);
      }

      const [reservationsResponse, tablesResponse] = await Promise.all([
        fetch(`/api/health?restaurantId=${restaurantId}`, { cache: 'no-store' }),
        fetch(`/api/tables?restaurantId=${restaurantId}`, { cache: 'no-store' }),
      ]);
      const [reservationsData, tablesData] = await Promise.all([
        reservationsResponse.json(),
        tablesResponse.json(),
      ]);

      if (isActive) {
        setReservations(Array.isArray(reservationsData) ? reservationsData : []);
        setSensorTables(Array.isArray(tablesData) ? tablesData : []);
        setIsLoading(false);
      }
    };

    refresh();
    const interval = window.setInterval(() => refresh(false), 10000);
    const handleFocus = () => refresh(false);

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      isActive = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [restaurantId]);

  const filteredReservations = useMemo(() => {
    if (statusFilter === 'all') return reservations;
    return reservations.filter((reservation) => reservation.status === statusFilter);
  }, [reservations, statusFilter]);

  const stats = useMemo(() => ({
    all: reservations.length,
    pending: reservations.filter((reservation) => reservation.status === 'pending').length,
    confirmed: reservations.filter((reservation) => reservation.status === 'confirmed').length,
    cancelled: reservations.filter((reservation) => reservation.status === 'cancelled').length,
    completed: reservations.filter((reservation) => reservation.status === 'completed').length,
  }), [reservations]);

  const activeReservationsByTable = useMemo(() => {
    const activeReservations = new Map<number, Reservation>();
    reservations
      .filter((reservation) => reservation.tableId && (reservation.status === 'pending' || reservation.status === 'confirmed'))
      .forEach((reservation) => {
        if (reservation.tableId) activeReservations.set(reservation.tableId, reservation);
      });
    return activeReservations;
  }, [reservations]);

  const unavailableTablesCount = useMemo(
    () => sensorTables.filter((table) => table.isOccupied || activeReservationsByTable.has(table.tableId)).length,
    [activeReservationsByTable, sensorTables]
  );

  const updateStatus = async (id: string, status: ReservationStatus) => {
    const response = await fetch('/api/health', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });

    if (response.ok) {
      await loadReservations();
    }
  };

  const deleteReservation = async (id: string) => {
    const response = await fetch('/api/health', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (response.ok) {
      await loadReservations();
    }
  };

  return (
    <section className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Усього" value={stats.all} />
        <Stat label="Очікують" value={stats.pending} />
        <Stat label="Підтверджені" value={stats.confirmed} />
        <Stat label="Зайняті столи" value={unavailableTablesCount} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b p-4">
          <h2 className="text-xl font-bold">Схема доступності столів</h2>
          <p className="text-sm text-gray-500">{restaurantName}: дані зберігаються окремо від бронювань</p>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Оновлення стану столів...</div>
        ) : sensorTables.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="font-bold text-gray-900">Датчик ще не передавав дані</h3>
            <p className="mt-1 text-sm text-gray-500">Коли стіл змінить стан, запис зʼявиться у цьому блоці.</p>
          </div>
        ) : (
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {sensorTables.map((table) => {
              const activeReservation = activeReservationsByTable.get(table.tableId);
              const isUnavailable = table.isOccupied || Boolean(activeReservation);
              return (
                <div
                  key={table.id}
                  className={`rounded-lg border p-4 ${
                    isUnavailable ? 'border-red-200 bg-red-50 text-red-950' : 'border-emerald-200 bg-emerald-50 text-emerald-950'
                  }`}
                >
                  <div className="text-sm font-semibold opacity-75">Стіл №{table.tableId}</div>
                  <div className="mt-1 text-xl font-bold">
                    {activeReservation ? 'Заброньований' : table.isOccupied ? 'Зайнятий' : 'Вільний'}
                  </div>
                  <div className="mt-2 text-sm opacity-75">Місткість: {table.capacity || 4} ос.</div>
                  {activeReservation && (
                    <div className="mt-2 text-xs font-semibold opacity-75">
                      {activeReservation.date} о {activeReservation.time}
                    </div>
                  )}
                  {table.updatedAt && table.isOccupied && (
                    <div className="mt-2 text-xs opacity-70">
                      Оновлено: {new Date(table.updatedAt).toLocaleString('uk-UA')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 border-b p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">Бронювання</h2>
            <p className="text-sm text-gray-500">{restaurantName}: керування заявками гостей</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'confirmed', 'cancelled', 'completed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                  statusFilter === status ? 'border-amber-600 bg-amber-600 text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {status === 'all' ? 'Усі' : STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Завантаження бронювань...</div>
        ) : filteredReservations.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="font-bold text-gray-900">Бронювань поки немає</h3>
            <p className="mt-1 text-sm text-gray-500">Нові заявки для цього закладу з’являться тут після бронювання.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Гість</th>
                  <th className="px-4 py-3">Дата і час</th>
                  <th className="px-4 py-3">Стіл</th>
                  <th className="px-4 py-3">Людей</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3 text-right">Дії</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="align-top">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-900">{reservation.clientName || 'Без імені'}</div>
                      <div className="text-gray-500">{reservation.clientPhone || 'Телефон не вказано'}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold">{reservation.date || '-'}</div>
                      <div className="text-gray-500">{reservation.time || '-'} · {reservation.duration || '2'} год</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold">№{reservation.tableId || '-'}</div>
                      <div className="text-gray-500">до {reservation.tableCapacity || '-'} ос.</div>
                    </td>
                    <td className="px-4 py-4">{reservation.persons || '-'}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[reservation.status]}`}>
                        {STATUS_LABELS[reservation.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => updateStatus(reservation.id, 'confirmed')} className="rounded-md border border-green-200 px-3 py-2 font-semibold text-green-700 hover:bg-green-50">
                          Підтвердити
                        </button>
                        <button onClick={() => updateStatus(reservation.id, 'cancelled')} className="rounded-md border border-red-200 px-3 py-2 font-semibold text-red-700 hover:bg-red-50">
                          Скасувати
                        </button>
                        <button onClick={() => updateStatus(reservation.id, 'completed')} className="rounded-md border border-gray-200 px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50">
                          Завершити
                        </button>
                        <button onClick={() => deleteReservation(reservation.id)} className="rounded-md border border-gray-200 px-3 py-2 font-semibold text-gray-700 hover:bg-gray-50">
                          Видалити
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="text-sm font-semibold text-gray-500">{label}</div>
      <div className="mt-1 text-3xl font-bold text-gray-900">{value}</div>
    </div>
  );
}
