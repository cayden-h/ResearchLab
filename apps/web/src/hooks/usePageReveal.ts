import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function usePageReveal<T extends HTMLElement>(deps: ReadonlyArray<unknown> = []) {
  const scopeRef = useRef<T | null>(null);

  useEffect(() => {
    if (!scopeRef.current) {
      return;
    }

    const context = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('[data-reveal]');
      if (items.length === 0) {
        return;
      }

      gsap.set(items, {
        opacity: 0,
        y: 28,
      });

      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
      });
    }, scopeRef);

    return () => {
      context.revert();
    };
  }, deps);

  return scopeRef;
}
