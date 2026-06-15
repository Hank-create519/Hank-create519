import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NAV = [
  { path: '/', label: '首页', icon: '◆' },
  { path: '/new', label: '新建审查', icon: '◇' },
  { path: '/monitor', label: '监控', icon: '◎' },
  { path: '/config', label: '配置', icon: '◈' },
  { path: '/history', label: '历史', icon: '◉' },
];

export function Sidebar() {
  const loc = useLocation();
  const nav = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string) =>
    path === '/' ? loc.pathname === '/' : loc.pathname.startsWith(path);

  return (
    <aside style={{
      width: collapsed ? 52 : 200,
      flexShrink: 0,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'rgba(5,5,25,0.8)',
      backdropFilter: 'blur(32px)',
      WebkitBackdropFilter: 'blur(32px)',
      boxShadow: '1px 0 0 rgba(255,255,255,0.04), 4px 0 24px rgba(0,0,0,0.3)',
      position: 'relative',
      zIndex: 10,
      transition: 'width 300ms var(--ease-out-expo)',
      userSelect: 'none',
    }}>
      {/* macOS 拖拽区 */}
      <div style={{ height: 40, flexShrink: 0, WebkitAppRegion: 'drag' } as React.CSSProperties} />

      {/* Logo */}
      {!collapsed && (
        <div style={{ padding: '0 16px 20px' }}>
          <button
            onClick={() => nav('/')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textAlign: 'left',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.15em',
              backgroundImage: 'linear-gradient(135deg, #eef0ff, #b3bdf8, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Hank个人工作室
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: collapsed ? '0 10px' : '0 8px' }}>
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
                borderRadius: 8,
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                textDecoration: 'none',
                justifyContent: collapsed ? 'center' : 'flex-start',
                color: active ? 'rgba(237,240,255,0.95)' : 'rgba(180,190,230,0.40)',
                background: active ? 'rgba(79,108,247,0.10)' : 'transparent',
                position: 'relative',
                transition: 'all 150ms var(--ease-out-expo)',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              {active && (
                <span style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3,
                  height: 16,
                  borderRadius: '0 3px 3px 0',
                  background: 'linear-gradient(180deg, #4f6cf7, #d946ef)',
                }} />
              )}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18,
                height: 18,
                fontSize: 10,
                borderRadius: '50%',
                color: active ? 'rgba(200,210,245,0.9)' : 'rgba(255,255,255,0.20)',
                flexShrink: 0,
                transition: 'all 150ms var(--ease-out-expo)',
              }}>
                {item.icon}
              </span>
              {!collapsed && item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div style={{ padding: '16px 16px 24px' }}>
          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)', marginBottom: 12 }} />
          <p style={{ fontSize: 10, color: 'rgba(180,190,230,0.25)', lineHeight: 1.4 }}>
            请配置 API Key 后使用
          </p>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute',
          right: -14,
          bottom: 80,
          width: 14,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          background: 'rgba(15,15,40,0.9)',
          border: 'none',
          borderRadius: '0 8px 8px 0',
          boxShadow: '4px 0 12px rgba(0,0,0,0.3)',
          opacity: 0.5,
          transition: 'opacity 150ms',
          zIndex: 11,
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
        title={collapsed ? '展开' : '折叠'}
      >
        <span style={{ fontSize: 8, color: 'rgba(200,210,245,0.6)', transform: collapsed ? 'none' : 'rotate(180deg)', transition: 'transform 300ms' }}>
          ◀
        </span>
      </button>
    </aside>
  );
}
