import { useEffect, useMemo, useState } from 'react';
import { FeedbackBlock } from '../components/FeedbackBlock';
import { PageHeading } from '../components/PageHeading';
import { usePageReveal } from '../hooks/usePageReveal';
import { fetchGlossary } from '../lib/api';
import type { GlossaryItem } from '../lib/types';

export function GlossaryPage() {
  const scopeRef = usePageReveal<HTMLElement>([]);
  const [items, setItems] = useState<GlossaryItem[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGlossary()
      .then((response) => {
        setItems(response);
        setError('');
      })
      .catch(() => {
        setError('Glossary terms are unavailable right now.');
      });
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => item.term.toLowerCase().includes(normalizedQuery) || item.definition.toLowerCase().includes(normalizedQuery));
  }, [items, query]);

  return (
    <section ref={scopeRef} className="section-band">
      <div className="page-frame space-y-8">
        <div className="section-panel bg-[rgba(255,253,249,0.88)] px-6 py-8 lg:px-10" data-reveal>
          <PageHeading
            eyebrow="Glossary"
            title="Every academic term should be explainable in place."
            description="A clean reference layer keeps first-generation students from having to leave the workflow just to decode vocabulary."
          />
          <div className="mt-8 max-w-xl">
            <label className="field">
              <span>Search terms</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by term or definition" />
            </label>
          </div>
        </div>

        {error ? <FeedbackBlock title="Glossary issue" description={error} tone="danger" /> : null}

        <div className="grid gap-4 md:grid-cols-2" data-reveal>
          {filteredItems.map((item) => (
            <article key={item.term} className="editorial-panel bg-white px-6 py-6">
              <h2 className="font-display text-3xl text-primary">{item.term}</h2>
              <p className="body-copy mt-4 text-muted">{item.definition}</p>
            </article>
          ))}
        </div>

        {!error && filteredItems.length === 0 ? (
          <FeedbackBlock title="No matches" description="Try a broader term. The glossary search checks both the academic term and its explanation." />
        ) : null}
      </div>
    </section>
  );
}
