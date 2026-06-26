export default function ThemeToggle() {
  return (
    <button
      className="flex items-center justify-center w-8 h-8 rounded-md cursor-pointer transition-all duration-200"
      style={{
        background: 'rgba(0,0,0,0.03)',
        border: '1px solid rgba(0,0,0,0.06)',
        opacity: 0.5,
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
      title="Mac Light"
    >
      <span style={{ fontSize: 11, color: 'var(--mac-text-secondary)' }}>✦</span>
    </button>
  );
}
