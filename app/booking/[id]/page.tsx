"use client";

import React from 'react';
import Link from 'next/link';

// Це ті ж самі дані, щоб сторінка знала, що саме показати.
// (Коли буде MongoDB, ми просто зробимо запит за ID)
const DUMMY_TABLES = [
  { 
    id: '1', 
    name: 'Гасова лямпа', 
    type: 'Кафе', 
    location: 'вул. Вірменська, 20', 
    city: 'Львів', // Додано
    description: 'Перша в Україні музей-ресторація. Атмосфера старого Львова та величезна колекція лямп.', 
    capacity: 2, 
    isAvailable: true, 
    img: '/gasova-lyampa.jpg' 
  },
  { 
    id: '2', 
    name: 'Реберня під Арсеналом', 
    type: 'Ресторан', 
    location: 'вул. Підвальна, 5', 
    city: 'Львів', // Додано
    description: 'Найвідоміші ребра Львова, що готуються на відкритому вогні.', 
    capacity: 4, 
    isAvailable: true, 
    img: '/rebernya.jpg' 
  },
  { 
    id: '3', 
    name: 'Криївка', 
    type: 'Ресторан', 
    location: 'Площа Ринок, 14', 
    city: 'Львів', // Додано
    description: 'Останній сховок вояків УПА, де панує особливий патріотичний дух.', 
    capacity: 6, 
    isAvailable: false, 
    img: '/kryivka.jpg' 
  },
  { 
    id: '4', 
    name: 'ПЕРША ЛЬВІВСЬКА ГРИЛЬОВА РЕСТОРАЦІЯ М\'ЯСА ТА СПРАВЕДЛИВОСТІ', 
    type: 'Ресторан', 
    location: 'вул. Валова, 20', 
    city: 'Львів', // Додано
    description: 'Заклад про львівського ката. М’ясо на грилі та середньовічна атмосфера.', 
    capacity: 4, 
    isAvailable: true, 
    img: '/meat-and-justice.jpg' 
  },
  { 
    id: '14', 
    name: 'Bullart', 
    type: 'Ресторан', 
    location: 'пр-т Маяковського, 6', 
    city: 'Запоріжжя', // Додано
    description: 'Найкращі стейки у Запоріжжі.', 
    capacity: 4, 
    isAvailable: true, 
    img: 'https://via.placeholder.com/400x250?text=Bullart' 
  },
  { 
    id: '15', 
    name: 'Пузата Хата', 
    type: 'Кафе', 
    location: 'Хрещатик, 15', 
    city: 'Київ', // Додано
    description: 'Традиційна українська кухня у швидкому форматі.', 
    capacity: 6, 
    isAvailable: true, 
    img: 'https://via.placeholder.com/400x250?text=Пузата+Хата' 
  }
];

export default function RestaurantDetailsPage({ params }: { params: { id: string } }) {
  // Знаходимо заклад за ID з посилання
  const restaurant = DUMMY_TABLES.find(r => r.id === params.id);

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <h1 className="text-2xl font-bold">Заклад не знайдено</h1>
        <Link href="/booking" className="text-amber-600 hover:underline">Повернутися до каталогу</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-12">
      {/* Проста шапка */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <Link href="/booking" className="text-2xl font-bold text-amber-700 tracking-tighter hover:opacity-80 transition-opacity">Reserra</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Кнопка "Назад" */}
        <Link href="/booking" className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 font-medium mb-6 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Повернутися до каталогу
        </Link>

        {/* Велике фото */}
        <div className="w-full h-[400px] rounded-2xl overflow-hidden mb-8 shadow-md">
          <img src={restaurant.img} alt={restaurant.name} className="w-full h-full object-cover" />
        </div>

        {/* Інформація */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-2">{restaurant.type}</div>
          <h1 className="text-4xl font-extrabold mb-4 text-gray-900">{restaurant.name}</h1>
          
          <div className="flex items-center gap-2 text-gray-600 mb-8 font-medium">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            {restaurant.location} {restaurant.city && `(м. ${restaurant.city})`}
          </div>

          <h2 className="text-2xl font-bold mb-3">Про заклад</h2>
          <p className="text-gray-600 leading-relaxed text-lg mb-8">
            {restaurant.description || 'Детальний опис для цього закладу буде додано згодом. Тут готують смачні страви та завжди раді гостям!'}
          </p>

          {/* Галерея-заглушка */}
          <h2 className="text-2xl font-bold mb-4">Фотографії</h2>
          <div className="grid grid-cols-3 gap-4 mb-8">
             <div className="h-32 bg-gray-200 rounded-lg overflow-hidden"><img src={restaurant.img} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" /></div>
             <div className="h-32 bg-gray-200 rounded-lg overflow-hidden"><img src={restaurant.img} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" /></div>
             <div className="h-32 bg-gray-200 rounded-lg overflow-hidden"><img src={restaurant.img} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" /></div>
          </div>
        </div>
      </main>
    </div>
  );
}