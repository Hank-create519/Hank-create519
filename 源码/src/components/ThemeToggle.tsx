export default function ThemeToggle() {
  return (
    <button
      className="flex items-center justify-center w-8 h-8 rounded-md cursor-pointer transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        opacity: 0.5,
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
      title="Celestial Depth"
    >
      <span style={{ fontSize: 11, color: 'rgba(200,210,245,0.6)' }}>✦</span>
    </button>
  );
}
