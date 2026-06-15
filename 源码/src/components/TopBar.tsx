import { Link, useLocation, useNavigate } from 'react-router-dom';

const NAV = [
  { path: '/new', label: '审查' },
  { path: '/config', label: '配置' },
  { path: '/history', label: '历史' },
];

export function TopBar() {
  const loc = useLocation();
  const nav = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-12 flex items-center justify-between px-6"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      <button
        onClick={() => nav('/')}
        className="text-[13px] font-light tracking-[0.15em] text-text-secondary hover:text-text-primary transition-colors"
      >
        瀚 海
      </button>
      <nav className="flex items-center gap-6">
        {NAV.map((item) => {
          const active = item.path === '/' ? loc.pathname === '/' : loc.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`text-[12px] font-light tracking-wide transition-colors ${
                active ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
