interface FeedbackBlockProps {
  title: string;
  description: string;
  tone?: 'neutral' | 'danger';
}

export function FeedbackBlock({ title, description, tone = 'neutral' }: FeedbackBlockProps) {
  const toneClasses =
    tone === 'danger'
      ? 'bg-[rgba(140,32,32,0.08)] text-[#7f1d1d]'
      : 'bg-white/75 text-muted';

  return (
    <div className={`rounded-[1.25rem] px-5 py-4 ${toneClasses}`}>
      <p className="font-sans text-xs font-extrabold uppercase tracking-[0.2em]">{title}</p>
      <p className="mt-2 font-body text-sm leading-7">{description}</p>
    </div>
  );
}
