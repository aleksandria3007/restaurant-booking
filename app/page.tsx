"use client";

import React, { useState } from 'react';

// Тимчасові дані для відображення (пізніше ми замінимо це на запит до MongoDB)
const DUMMY_TABLES = [
  { id: '1', name: 'Гасова лямпа', type: 'Кафе', location: 'Центр', capacity: 2, isAvailable: true, img: 'https://via.placeholder.com/400x250?text=Мазох-cafe' },
  { id: '2', name: 'Реберня під Арсеналом', type: 'Ресторан', location: 'Центр', capacity: 4, isAvailable: true, img: 'https://via.placeholder.com/400x250?text=Реберня' },
  { id: '3', name: 'Криївка', type: 'Ресторан', location: 'Площа Ринок', capacity: 6, isAvailable: false, img: 'https://via.placeholder.com/400x250?text=Криївка' },
];

export default function BookingPage() {
  // Стани для форми підбору столика
  const [persons, setPersons] = useState("2");
  const [date, setDate] = useState("2026-04-27");
  const [time, setTime] = useState("17:00");

  // НОВІ СТАНИ: для міста та пошуку по назві
  const [city, setCity] = useState("Львів");
  const [searchQuery, setSearchQuery] = useState("");

  // Обробник пошуку столика (нижня форма)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Шукаємо столик на ${persons} людей, дата: ${date}, час: ${time}, місто: ${city}`);
    // Тут буде логіка фільтрації бази даних
  };

  // Обробник пошуку за назвою (форма в шапці)
  const handleTextSearch = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Шукаємо заклад "${searchQuery}" у місті ${city}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      
      {/* HEADER (Шапка) */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Ліва частина шапки: Логотип + Місто + Пошук */}
          <div className="flex items-center gap-4 md:gap-6 flex-1">
            <div className="text-2xl font-bold text-amber-700 tracking-tighter">Reserra</div>
            
            {/* Вибір міста (Селект) */}
            <div className="relative hidden sm:block z-10">
              <select 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="appearance-none bg-white border border-gray-300 text-gray-700 py-1.5 pl-3 pr-8 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-sm font-medium cursor-pointer"
              >
                <option value="Львів">Львів</option>
                <option value="Запоріжжя">Запоріжжя</option>
                <option value="Київ">Київ</option>
              </select>
              {/* Кастомна стрілочка для селекта */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>

            {/* Рядок текстового пошуку */}
            <form onSubmit={handleTextSearch} className="hidden md:flex relative w-full max-w-sm">
              <input 
                type="text" 
                placeholder="Пошук..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-l py-1.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
              />
              <button type="submit" className="bg-gray-50 border border-l-0 border-gray-300 rounded-r px-3 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </button>
            </form>
          </div>

          {/* Права частина шапки: Навігація + Авторизація */}
          <div className="flex items-center gap-6 pl-4">
            <nav className="hidden lg:flex gap-6 font-medium text-sm text-gray-600">
              <a href="#" className="text-amber-700 border-b-2 border-amber-700 pb-1 whitespace-nowrap">Заклади</a>
              <a href="#" className="hover:text-amber-700 transition-colors whitespace-nowrap">Банкетні зали</a>
              <a href="#" className="hover:text-amber-700 transition-colors whitespace-nowrap">Новини</a>
            </nav>
            
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold hidden xl:block whitespace-nowrap">(097) 805 54 41</span>
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded text-sm transition-colors whitespace-nowrap">
                Увійти
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* SEARCH BAR (Панель підбору столика) */}
      <div className="bg-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg shadow-lg flex flex-col md:flex-row items-end gap-4">
            
            <div className="flex-1 w-full">
              <label className="block text-xs text-gray-500 font-semibold mb-1 uppercase">Для:</label>
              <select 
                value={persons} 
                onChange={(e) => setPersons(e.target.value)}
                className="w-full border-gray-300 border rounded p-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="2">2-ох людей</option>
                <option value="4">4-ох людей</option>
                <option value="6">6-ти людей</option>
                <option value="10">10-ти людей</option>
              </select>
            </div>

            <div className="flex-1 w-full">
              <label className="block text-xs text-gray-500 font-semibold mb-1 uppercase">Дата:</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border-gray-300 border rounded p-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div className="flex-1 w-full">
              <label className="block text-xs text-gray-500 font-semibold mb-1 uppercase">Час:</label>
              <select 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border-gray-300 border rounded p-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="17:00">17:00</option>
                <option value="18:00">18:00</option>
                <option value="19:00">19:00</option>
                <option value="20:00">20:00</option>
              </select>
            </div>

            <div className="w-full md:w-auto">
              <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-8 rounded h-[42px] transition-colors">
                Підібрати
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* CATALOG (Сітка закладів/столиків) */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Каталог закладів {city !== "Львів" ? city : "Львова"}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DUMMY_TABLES.map((table) => (
            <div key={table.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="h-48 bg-gray-200 overflow-hidden relative">
                <img src={table.img} alt={table.name} className="w-full h-full object-cover" />
                {!table.isAvailable && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-bold text-lg bg-red-600 px-4 py-1 rounded">Немає місць</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="text-xs text-gray-500 mb-1">{table.type}</div>
                <h3 className="text-xl font-bold mb-2">{table.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  {table.location}
                </div>
                
                <button 
                  disabled={!table.isAvailable}
                  className={`w-full py-2 rounded font-semibold transition-colors ${
                    table.isAvailable 
                      ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {table.isAvailable ? 'Забронювати стіл' : 'Зайнято'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
}