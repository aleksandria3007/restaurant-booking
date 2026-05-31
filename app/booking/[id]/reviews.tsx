"use client";

import type { FormEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

type CurrentUser = {
  id: string;
  name: string;
  phone: string;
};

type Review = {
  id: string;
  userName: string;
  rating: number;
  text: string;
  createdAt?: string;
};

export default function RestaurantReviews({ restaurantId }: { restaurantId: string }) {
  const [user] = useState<CurrentUser | null>(() => {
    if (typeof window === 'undefined') return null;
    const savedUser = window.localStorage.getItem('reserraUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState("5");
  const [text, setText] = useState("");

  const loadReviews = useCallback(async () => {
    const response = await fetch(`/api/reviews?restaurantId=${restaurantId}`, { cache: 'no-store' });
    const data = await response.json();
    setReviews(Array.isArray(data) ? data : []);
  }, [restaurantId]);

  useEffect(() => {
    const timeout = window.setTimeout(loadReviews, 0);
    return () => window.clearTimeout(timeout);
  }, [loadReviews]);

  const submitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId, userId: user.id, rating, text }),
    });

    if (response.ok) {
      setText("");
      setRating("5");
      await loadReviews();
    }
  };

  return (
    <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-2xl font-bold text-gray-950">Відгуки</h2>

      {user ? (
        <form onSubmit={submitReview} className="mt-4 grid gap-3">
          <select value={rating} onChange={(e) => setRating(e.target.value)} className="w-full rounded-lg border p-3 md:w-40">
            {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} з 5</option>)}
          </select>
          <textarea required value={text} onChange={(e) => setText(e.target.value)} placeholder="Ваш відгук" className="min-h-28 rounded-lg border p-3" />
          <button className="w-full rounded-lg bg-amber-600 px-4 py-3 font-bold text-white hover:bg-amber-700 md:w-fit">
            Залишити відгук
          </button>
        </form>
      ) : (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
          Відгуки можуть залишати лише зареєстровані користувачі.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {reviews.length === 0 ? (
          <p className="text-gray-500">Відгуків поки немає.</p>
        ) : reviews.map((review) => (
          <article key={review.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="font-bold">{review.userName}</div>
              <div className="text-sm font-bold text-amber-700">{review.rating}/5</div>
            </div>
            <p className="mt-2 text-gray-700">{review.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
