export default function FloatingBlobBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      {/* Top-right blob */}
      <div
        className="blob-anim-1 absolute rounded-full"
        style={{
          width: 560, height: 560,
          top: -140, right: -140,
          background: 'radial-gradient(circle, #FFD6E0 0%, #FFB7C5 60%, transparent 100%)',
          filter: 'blur(64px)',
          opacity: 0.45,
        }}
      />
      {/* Bottom-left blob */}
      <div
        className="blob-anim-2 absolute rounded-full"
        style={{
          width: 440, height: 440,
          bottom: -80, left: -80,
          background: 'radial-gradient(circle, #FFE4EC 0%, #FFD6E0 70%, transparent 100%)',
          filter: 'blur(56px)',
          opacity: 0.5,
        }}
      />
      {/* Center blob */}
      <div
        className="blob-anim-3 absolute rounded-full"
        style={{
          width: 320, height: 320,
          top: '50%', left: '45%',
          background: 'radial-gradient(circle, #FFB7C5 0%, transparent 70%)',
          filter: 'blur(48px)',
          opacity: 0.28,
        }}
      />
    </div>
  )
}
