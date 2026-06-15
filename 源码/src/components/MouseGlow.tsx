import { useEffect, useRef, useState } from 'react';

export default function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -9999, y: -9999 });
  const current = useRef({ x: -9999, y: -9999 });
  const raf = useRef(0);
  const [theme, setTheme] = useState<'dark' | 'light'>(
    () => (document.documentElement.dataset.theme as 'dark' | 'light') || 'dark'
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme((document.documentElement.dataset.theme as 'dark' | 'light') || 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      const dx = target.current.x - current.current.x;
      const dy = target.current.y - current.current.y;
      current.current.x += dx * 0.06;
      current.current.y += dy * 0.06;
      el.style.transform = `translate(${current.current.x - 150}px, ${current.current.y - 150}px)`;
      raf.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 300,
        height: 300,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 9999,
        background: theme === 'dark'
          ? 'radial-gradient(ellipse at center, rgba(139,156,247,0.08) 0%, rgba(94,106,210,0.04) 25%, rgba(139,92,246,0.02) 50%, transparent 100%)'
          : 'radial-gradient(ellipse at center, rgba(94,106,210,0.04) 0%, rgba(139,156,247,0.02) 25%, rgba(124,58,237,0.01) 50%, transparent 100%)',
        filter: 'blur(20px)',
        willChange: 'transform',
      }}
    />
  );
}
