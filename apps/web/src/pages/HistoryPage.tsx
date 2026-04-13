import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchHistory } from '../lib/api';
import type { HistoryItem } from '../lib/types';

export function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    fetchHistory().then(setItems);
  }, []);

  return (
    <section className="px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.24em] text-secondary">History</p>
        <h1 className="mt-3 font-display text-6xl text-primary">Previous research kits</h1>
        <div className="mt-10 grid gap-5">
          {items.length === 0 && (
            <div className="rounded-[1.6rem] bg-surface-low p-8 text-muted">No runs yet. Start a kit from the intake form.</div>
          )}
          {items.map((item) => (
            <article key={item.run_id} className="flex flex-col gap-5 rounded-[1.6rem] bg-white p-6 shadow-ambient md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-display text-3xl text-primary">{item.student_name}</p>
                <p className="mt-2 font-body text-sm text-muted">{item.university}</p>
                <p className="mt-1 font-body text-sm text-muted">{new Date(item.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-8 text-sm text-muted">
                <span>{item.professor_count} professors</span>
                <span>{item.grant_count} grants</span>
                <Link className="rounded-full bg-primary px-6 py-3 font-sans text-xs font-extrabold uppercase tracking-[0.18em] text-white" to={`/results/${item.run_id}`}>
                  Open kit
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

