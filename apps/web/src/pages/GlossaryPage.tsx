import { useEffect, useState } from 'react';
import { fetchGlossary } from '../lib/api';
import type { GlossaryItem } from '../lib/types';

export function GlossaryPage() {
  const [items, setItems] = useState<GlossaryItem[]>([]);

  useEffect(() => {
    fetchGlossary().then(setItems);
  }, []);

  return (
    <section className="px-6 py-12 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.24em] text-secondary">Glossary</p>
        <h1 className="mt-3 font-display text-6xl text-primary">Every academic term should be explainable in place.</h1>
        <div className="mt-10 grid gap-5">
          {items.map((item) => (
            <article key={item.term} className="rounded-[1.6rem] bg-white p-6 shadow-ambient">
              <h2 className="font-display text-3xl text-primary">{item.term}</h2>
              <p className="mt-3 font-body text-base leading-8 text-muted">{item.definition}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

