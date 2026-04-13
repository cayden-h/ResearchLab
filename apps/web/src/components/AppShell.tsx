import { Link, NavLink } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `transition-colors ${isActive ? 'text-primary' : 'text-slate-600 hover:text-primary'}`;

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background text-ink">
      <header className="sticky top-0 z-40 border-b border-outline/40 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link to="/" className="font-display text-3xl text-primary">
            ResearchBridge
          </Link>
          <nav className="hidden items-center gap-6 font-sans text-sm font-semibold md:flex">
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
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

