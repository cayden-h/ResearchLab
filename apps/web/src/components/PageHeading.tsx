import type { ReactNode } from 'react';

interface PageHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'default' | 'light';
}

export function PageHeading({ eyebrow, title, description, actions, align = 'left', tone = 'default' }: PageHeadingProps) {
  const titleColor = tone === 'light' ? 'text-white' : 'text-primary';
  const descriptionColor = tone === 'light' ? 'text-slate-200' : 'text-muted';
  const eyebrowColor = tone === 'light' ? 'text-sky-200' : 'text-secondary';

  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className={`eyebrow ${eyebrowColor}`}>{eyebrow}</p>
      <h1 className={`display-title mt-4 ${titleColor}`}>{title}</h1>
      {description ? <p className={`body-copy mt-5 max-w-2xl ${descriptionColor}`}>{description}</p> : null}
      {actions ? <div className={`mt-8 flex flex-wrap gap-3 ${align === 'center' ? 'justify-center' : ''}`}>{actions}</div> : null}
    </div>
  );
}
