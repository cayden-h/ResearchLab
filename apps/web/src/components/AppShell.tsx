import { Link, NavLink } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 transition ${isActive ? 'bg-white/80 text-primary shadow-ambient' : 'text-muted hover:bg-white/55 hover:text-primary'}`;

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell-bg min-h-screen bg-background text-ink">
      <header className="sticky top-0 z-40">
        <div className="page-frame py-4">
          <div className="section-panel flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="flex items-center justify-between gap-4">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-hero text-lg font-extrabold text-white shadow-ambient">
                  RB
                </div>
                <div>
                  <p className="font-display text-3xl leading-none text-primary">ResearchBridge</p>
                  <p className="mt-1 font-sans text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-secondary">
                    Research kit orchestration
                  </p>
                </div>
              </Link>
              <Link to="/intake" className="primary-button md:hidden">
                Start
              </Link>
            </div>

            <nav className="flex flex-wrap items-center gap-2 font-sans text-sm font-semibold">
              <NavLink to="/" className={navLinkClasses} end>
                Home
              </NavLink>
              <NavLink to="/intake" className={navLinkClasses}>
                Build Kit
              </NavLink>
              <NavLink to="/glossary" className={navLinkClasses}>
                Glossary
              </NavLink>
              <NavLink to="/history" className={navLinkClasses}>
                History
              </NavLink>
            </nav>

            <div className="hidden md:block">
              <Link to="/intake" className="primary-button">
                Start a Kit
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="pb-16">
        {children}
      </main>
    </div>
  );
}

