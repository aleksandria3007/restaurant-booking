"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Тимчасові дані з описами для сторінки деталей
const DUMMY_TABLES = [
  //Львів
  { id: '1', name: 'Гасова лямпа', type: 'Кафе', location: 'вул. Вірменська, 20', city: 'Львів', description: 'Перша в Україні музей-ресторація. Атмосфера старого Львова та величезна колекція лямп.', capacity: 2, isAvailable: true, img: '/gasova-lyampa.jpg' },
  { id: '2', name: 'Реберня під Арсеналом', type: 'Ресторан', location: 'вул. Підвальна, 5', city: 'Львів', description: 'Найвідоміші ребра Львова, що готуються на відкритому вогні.', capacity: 4, isAvailable: true, img: '/rebernya.jpg' },
  { id: '3', name: 'Криївка', type: 'Ресторан', location: 'Площа Ринок, 14', city: 'Львів', description: 'Останній сховок вояків УПА, де панує особливий патріотичний дух.', capacity: 6, isAvailable: false, img: '/kryivka.jpg' },
  { id: '4', name: 'ПЕРША ЛЬВІВСЬКА ГРИЛЬОВА РЕСТОРАЦІЯ М\'ЯСА ТА СПРАВЕДЛИВОСТІ', type: 'Ресторан', location: 'вул. Валова, 20', city: 'Львів', description: 'Заклад про львівського ката. М’ясо на грилі та середньовічна атмосфера.', capacity: 4, isAvailable: true, img: '/meat-and-justice.jpg' },
  { id: '5', name: 'GRAND CAFE LEOPOLIS', type: 'Кафе', location: 'пл. Ринок, 1', city: 'Львів', description: 'Кафе у Ратуші з найкращим видом та десертами.', capacity: 2, isAvailable: true, img: '/grand-cafe.jpeg' },
  { id: '6', name: 'ЛЬВІВСЬКА КОПАЛЬНЯ КАВИ', type: 'Кав\'ярня', location: 'пл. Ринок, 10', city: 'Львів', description: 'Тут каву видобувають прямо з шахти під площею Ринок.', capacity: 4, isAvailable: true, img: '/kopalnya-kavy.jpg' },
  { id: '7', name: 'MARINAD MEAT BAR', type: 'Бар', location: 'вул. Личаківська, 135', city: 'Львів', description: 'Сучасний м’ясний бар з авторськими коктейлями.', capacity: 6, isAvailable: true, img: '/marinad-meat-bar.jpg' },
  { id: '10', name: 'ДЗИҐА', type: 'Кафе', location: 'вул. Вірменська, 35', city: 'Львів', description: 'Мистецьке серце Львова. Джаз, виставки та смачна кухня.', capacity: 4, isAvailable: true, img: '/dzyga.jpg' },
  { id: '11', name: 'НАЙДОРОЖЧА РЕСТОРАЦІЯ ГАЛИЧИНИ', type: 'Ресторан', location: 'пл. Ринок, 14/8', city: 'Львів', description: 'Масонська ложа з таємним входом та особливими цінами.', capacity: 2, isAvailable: true, img: '/expensive-rest.jpg' },
  { id: '12', name: 'ДОБРИЙ ДРУГ', type: 'Паб', location: 'вул. Лесі Українки, 19', city: 'Львів', description: 'Затишний паб з крафтовим пивом та піцою.', capacity: 6, isAvailable: true, img: '/dobryi-drug.jpg' },
  { id: '13', name: 'ГРУШЕВСЬКИЙ', type: 'Ресторан', location: 'пр-т Шевченка, 28', city: 'Львів', description: 'Кіно-джаз ресторан у самому центрі міста.', capacity: 4, isAvailable: true, img: '/hrushevskyi.jpg' },
//Запоріжжя
  { id: '14', name: 'Bullart', type: 'Ресторан', location: 'пр-т Маяковського, 6', city: 'Запоріжжя', description: 'Найкращі стейки у Запоріжжі.', capacity: 4, isAvailable: true, img: 'https://via.placeholder.com/400x250?text=Bullart' },
  { id: '15', name: 'Шелест', type: 'Ресторан', location: 'бульвар Шевченка, 16', city: 'Запоріжжя', description: 'Найкращі стейки у Запоріжжі.', capacity: 4, isAvailable: true, img: '/shelest.jpg' },
  { id: '16', name: 'Бергамот', type: 'Ресторан', location: 'вулиця Перемоги, 59', city: 'Запоріжжя', description: 'Найкращі стейки у Запоріжжі.', capacity: 4, isAvailable: true, img: '/bergamot.jpg' },
  { id: '17', name: 'Джобс кафе', type: 'Кафе', location: 'проспект Соборний, 147', city: 'Запоріжжя', description: 'Найкращі стейки у Запоріжжі.', capacity: 4, isAvailable: true, img: '/jobs-cafe.jpg' },
  { id: '18', name: 'Шелест', type: 'Ресторан', location: 'бульвар Шевченка, 16', city: 'Запоріжжя', description: 'Найкращі стейки у Запоріжжі.', capacity: 4, isAvailable: true, img: '/shelest.jpg' },
  { id: '19', name: 'Шелест', type: 'Ресторан', location: 'бульвар Шевченка, 16', city: 'Запоріжжя', description: 'Найкращі стейки у Запоріжжі.', capacity: 4, isAvailable: true, img: '/shelest.jpg' },
  
  { id: '20', name: 'Пузата Хата', type: 'Кафе', location: 'Хрещатик, 15', city: 'Київ', description: 'Традиційна українська кухня у швидкому форматі.', capacity: 6, isAvailable: true, img: 'https://via.placeholder.com/400x250?text=Пузата+Хата' }
];

const PLACE_TYPES = [
  { label: 'Бар', count: 1 },
  { label: "Кав'ярня", count: 1 },
  { label: 'Кафе', count: 4 },
  { label: 'Паб', count: 1 },
  { label: 'Ресторан', count: 6 },
];

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

export default function HomePage() {
  const [persons, setPersons] = useState("2");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [city, setCity] = useState("Львів");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTableForBooking, setSelectedTableForBooking] = useState<any>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [duration, setDuration] = useState("2");

  const toggleType = (label: string) => {
    setSelectedTypes(prev => prev.includes(label) ? prev.filter(t => t !== label) : [...prev, label]);
  };

  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  useEffect(() => { setDate(getTodayString()); }, []);

  useEffect(() => {
    if (!date) return;
    const today = getTodayString();
    let validTimes = ALL_TIMES;
    if (date === today) {
      const now = new Date();
      validTimes = ALL_TIMES.filter(t => {
        const [h, m] = t.split(':').map(Number);
        return h > now.getHours() || (h === now.getHours() && m > now.getMinutes());
      });
    }
    setAvailableTimes(validTimes);
    if (validTimes.length > 0 && !validTimes.includes(time)) setTime(validTimes[0]);
  }, [date, time]);

  const filteredTables = DUMMY_TABLES.filter(table => {
    const matchCity = table.city === city;
    const matchType = selectedTypes.length === 0 || selectedTypes.includes(table.type);
    const matchSearch = table.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCity && matchType && matchSearch;
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Бронювання успішне для ${clientName} у ${selectedTableForBooking.name}`);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-12 relative">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6 flex-1">
            <div className="text-2xl font-bold text-amber-700 tracking-tighter">Reserra</div>
            <select value={city} onChange={(e) => { setCity(e.target.value); setSearchQuery(""); }} className="bg-white border rounded p-1.5 text-sm cursor-pointer">
              <option value="Львів">Львів</option>
              <option value="Запоріжжя">Запоріжжя</option>
              <option value="Київ">Київ</option>
            </select>
            <input type="text" placeholder="Пошук..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="hidden md:block border rounded py-1.5 px-3 text-sm max-w-sm w-full" />
          </div>
          <button className="bg-amber-600 text-white px-4 py-2 rounded text-sm font-bold ml-4">Увійти</button>
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
            <select value={time} onChange={(e) => setTime(e.target.value)} disabled={availableTimes.length === 0} className="w-full p-1 focus:outline-none disabled:text-gray-300">
              {availableTimes.length > 0 ? availableTimes.map(t => <option key={t} value={t}>{t}</option>) : <option>Немає часу</option>}
            </select>
          </div>
          <button className="bg-amber-600 text-white font-bold py-3 rounded-lg hover:bg-amber-700 transition-colors uppercase text-sm">Підібрати</button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <h2 className="font-bold text-lg uppercase mb-4">Параметри:</h2>
          <div className="bg-white border rounded shadow-sm p-4">
            <h3 className="font-bold mb-3 border-b pb-2">Тип закладу:</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {PLACE_TYPES.map(type => (
                <label key={type.label} className="flex items-center gap-3 cursor-pointer hover:text-amber-700 transition-colors">
                  <input type="checkbox" checked={selectedTypes.includes(type.label)} onChange={() => toggleType(type.label)} className="w-4 h-4 accent-amber-600" />
                  <span className="text-sm">{type.label} <span className="text-gray-400">({type.count})</span></span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-6">Каталог закладів</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTables.map((table) => (
              <div key={table.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group border-gray-100">
                <Link href={`/booking/${table.id}`} className="flex-1">
                  <div className="h-48 overflow-hidden relative">
                    <img src={table.img} alt={table.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    {!table.isAvailable && <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-bold text-white uppercase tracking-widest">Зайнято</div>}
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{table.type}</span>
                    <h3 className="text-lg font-bold mb-1 leading-tight group-hover:text-amber-700 transition-colors">{table.name}</h3>
                    <div className="flex items-start gap-1 text-xs text-gray-500 font-medium">
                      <svg className="w-3.5 h-3.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      {table.location}
                    </div>
                  </div>
                </Link>
                <div className="p-4 pt-0">
                  <button onClick={() => { setSelectedTableForBooking(table); setIsModalOpen(true); }} disabled={!table.isAvailable} className="w-full py-2.5 bg-amber-50 text-amber-800 rounded-lg font-bold hover:bg-amber-100 transition-colors disabled:bg-gray-100 disabled:text-gray-400">
                    Забронювати стіл
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {isModalOpen && selectedTableForBooking && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold">Бронювання</h2>
                <p className="text-xs text-gray-500 font-medium">{selectedTableForBooking.name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleBookingSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Ваше ім'я</label>
                <input required type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full border rounded-lg p-2.5 focus:ring-2 ring-amber-500 focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Телефон</label>
                <input required type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="w-full border rounded-lg p-2.5 focus:ring-2 ring-amber-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Дата</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">Час</label>
                  <select value={time} onChange={(e) => setTime(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm">
                    {availableTimes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Тривалість (год)</label>
                <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm">
                  {[1,2,3,4].map(v => <option key={v} value={v}>{v} {v === 1 ? 'година' : 'години'}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full py-3.5 bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-600/30 hover:bg-amber-700 transition-all uppercase text-sm tracking-widest mt-4">
                Підтвердити резерв
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}