import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FeedbackBlock } from '../components/FeedbackBlock';
import { PageHeading } from '../components/PageHeading';
import { usePageReveal } from '../hooks/usePageReveal';
import { fetchHistory } from '../lib/api';
import { formatDateTime, toTitleCase } from '../lib/format';
import type { HistoryItem } from '../lib/types';

export function HistoryPage() {
  const scopeRef = usePageReveal<HTMLElement>([]);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory()
      .then((response) => {
        setItems(response);
        setError('');
      })
      .catch(() => {
        setError('History is unavailable right now.');
      });
  }, []);

  return (
    <section ref={scopeRef} className="section-band">
      <div className="page-frame space-y-8">
        <div className="section-panel bg-[rgba(255,253,249,0.88)] px-6 py-8 lg:px-10" data-reveal>
          <PageHeading
            eyebrow="History"
            title="Previous research kits"
            description="Runs stay organized as reusable records so students can return to earlier kits, compare outputs, and export later."
            actions={<Link to="/intake" className="primary-button">Build Another Kit</Link>}
          />
        </div>

        {error ? <FeedbackBlock title="History issue" description={error} tone="danger" /> : null}

        {items.length === 0 && !error ? (
          <div data-reveal>
            <FeedbackBlock
              title="No runs yet"
              description="The first completed pipeline will appear here with links back to its results and export view."
            />
          </div>
        ) : null}

        <div className="grid gap-4" data-reveal>
          {items.map((item) => (
            <article key={item.run_id} className="section-panel bg-[rgba(255,253,249,0.88)] px-6 py-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-display text-3xl text-primary">{item.student_name}</p>
                  <p className="mt-2 font-body text-sm text-muted">{item.university}</p>
                  <p className="mt-1 font-body text-sm text-muted">{formatDateTime(item.created_at)}</p>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
                  <span className="font-sans text-xs font-extrabold uppercase tracking-[0.16em] text-muted">{toTitleCase(item.goal)} goal</span>
                  <span className="font-body text-sm text-muted">{item.professor_count} professors</span>
                  <span className="font-body text-sm text-muted">{item.grant_count} grants</span>
                  <Link className="primary-button" to={`/results/${item.run_id}`}>
                    Open Kit
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
