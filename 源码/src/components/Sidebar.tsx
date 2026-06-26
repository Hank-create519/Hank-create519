import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SpotlightContainer } from './SpotlightContainer';

export function Sidebar() {
  const { t, i18n } = useTranslation();
  const loc = useLocation();
  const nav = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const NAV = [
    { path: '/', label: t('nav.home'), icon: '◆' },
    { path: '/new', label: t('nav.newReview'), icon: '◇' },
    { path: '/monitor', label: t('nav.monitor'), icon: '◎' },
    { path: '/config', label: t('nav.config'), icon: '◈' },
    { path: '/history', label: t('nav.history'), icon: '◉' },
    { path: '/about', label: t('nav.about'), icon: '○' },
  ];

  const isActive = (path: string) =>
    path === '/' ? loc.pathname === '/' : loc.pathname.startsWith(path);

  const toggleLang = () => {
    const next = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(next);
  };

  return (
    <aside
      style={{
        position: 'fixed',
        left: 12,
        top: 12,
        bottom: 12,
        width: collapsed ? 60 : 208,
        zIndex: 50,
        transition: 'width 300ms var(--ease-out-expo)',
        userSelect: 'none',
      }}
    >
      <SpotlightContainer
        className="h-full flex flex-col p-3 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(24px) saturate(150%)',
          WebkitBackdropFilter: 'blur(24px) saturate(150%)',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 12px 40px -12px rgba(0,0,0,0.08)',
        } as React.CSSProperties}
      >
        <div className="relative z-10 h-full flex flex-col">
          {/* macOS drag region */}
          <div
            style={{
              height: 32,
              flexShrink: 0,
              WebkitAppRegion: 'drag',
            } as React.CSSProperties}
          />

          {/* Logo */}
          {!collapsed && (
            <div style={{ padding: '0 8px 16px' }}>
              <button
                onClick={() => nav('/')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  textAlign: 'left',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: 'var(--mac-text-primary)',
                }}
              >
                HankAI
              </button>
            </div>
          )}

          {/* Navigation */}
          <nav
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              padding: collapsed ? '0' : '0 4px',
            }}
          >
            {NAV.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => nav(item.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: collapsed ? '10px 0' : '10px 12px',
                    borderRadius: 10,
                    fontSize: 12.5,
                    fontWeight: active ? 600 : 400,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    color: active
                      ? 'var(--mac-blue)'
                      : 'var(--mac-text-tertiary)',
                    background: active
                      ? 'rgba(0,122,255,0.06)'
                      : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'all 150ms var(--ease-out-expo)',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
                      e.currentTarget.style.color = 'var(--mac-text-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--mac-text-tertiary)';
                    }
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 18,
                      height: 18,
                      fontSize: 10,
                      flexShrink: 0,
                      color: active
                        ? 'var(--mac-blue)'
                        : 'var(--mac-text-tertiary)',
                      transition: 'all 150ms',
                    }}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span style={{ letterSpacing: '-0.01em' }}>
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          {!collapsed && (
            <div style={{ padding: '12px 8px 4px' }}>
              <div
                style={{
                  height: 1,
                  background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.06), transparent)',
                  marginBottom: 10,
                }}
              />
              <button
                onClick={toggleLang}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'rgba(0,0,0,0.02)',
                  color: 'var(--mac-text-tertiary)',
                  fontSize: 10,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                  e.currentTarget.style.color = 'var(--mac-text-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.02)';
                  e.currentTarget.style.color = 'var(--mac-text-tertiary)';
                }}
              >
                <span style={{ fontSize: 10 }}>
                  {i18n.language === 'zh' ? 'EN' : '中'}
                </span>
                <span>{t('lang.switch')}</span>
              </button>
            </div>
          )}
        </div>
      </SpotlightContainer>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute',
          right: -16,
          bottom: 60,
          width: 16,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: '0 10px 10px 0',
          boxShadow: '4px 0 16px rgba(0,0,0,0.04)',
          opacity: 0.6,
          transition: 'opacity 150ms',
          zIndex: 51,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.6';
        }}
      >
        <span
          style={{
            fontSize: 8,
            color: 'var(--mac-text-tertiary)',
            transform: collapsed ? 'none' : 'rotate(180deg)',
            transition: 'transform 300ms',
            lineHeight: 1,
          }}
        >
          ◀
        </span>
      </button>
    </aside>
  );
}
