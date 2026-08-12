const BUNNIES = [
  { top: "8%", left: "6%", size: 54, delay: "0s", duration: "7s", anim: "bunny-hop", opacity: 0.55 },
  { top: "18%", left: "78%", size: 72, delay: "0.8s", duration: "9s", anim: "bunny-drift", opacity: 0.45 },
  { top: "42%", left: "88%", size: 48, delay: "1.4s", duration: "6.5s", anim: "bunny-wiggle", opacity: 0.5 },
  { top: "68%", left: "4%", size: 64, delay: "0.3s", duration: "8s", anim: "bunny-float", opacity: 0.4 },
  { top: "75%", left: "72%", size: 58, delay: "1.1s", duration: "7.5s", anim: "bunny-hop", opacity: 0.48 },
  { top: "32%", left: "48%", size: 40, delay: "2s", duration: "10s", anim: "bunny-drift", opacity: 0.28 },
  { top: "88%", left: "38%", size: 50, delay: "0.6s", duration: "8.5s", anim: "bunny-wiggle", opacity: 0.42 },
  { top: "12%", left: "38%", size: 36, delay: "1.7s", duration: "6s", anim: "bunny-float", opacity: 0.35 },
] as const;

function RabbitClipart({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* ears */}
      <ellipse cx="38" cy="28" rx="14" ry="32" fill="#FB7185" transform="rotate(-18 38 28)" />
      <ellipse cx="82" cy="28" rx="14" ry="32" fill="#FB7185" transform="rotate(18 82 28)" />
      <ellipse cx="38" cy="30" rx="7" ry="20" fill="#FECDD3" transform="rotate(-18 38 30)" />
      <ellipse cx="82" cy="30" rx="7" ry="20" fill="#FECDD3" transform="rotate(18 82 30)" />
      {/* head */}
      <circle cx="60" cy="68" r="34" fill="#FFF1F5" stroke="#F9A8D4" strokeWidth="3" />
      {/* cheeks */}
      <circle cx="40" cy="74" r="8" fill="#FDA4AF" opacity="0.7" />
      <circle cx="80" cy="74" r="8" fill="#FDA4AF" opacity="0.7" />
      {/* eyes */}
      <circle cx="48" cy="64" r="5" fill="#831843" />
      <circle cx="72" cy="64" r="5" fill="#831843" />
      <circle cx="49.5" cy="62.5" r="1.6" fill="white" />
      <circle cx="73.5" cy="62.5" r="1.6" fill="white" />
      {/* nose + smile */}
      <ellipse cx="60" cy="74" rx="5" ry="3.5" fill="#F472B6" />
      <path d="M54 80 Q60 86 66 80" stroke="#BE185D" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* whiskers */}
      <path d="M28 72 H42" stroke="#F9A8D4" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M28 78 H42" stroke="#F9A8D4" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M78 72 H92" stroke="#F9A8D4" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M78 78 H92" stroke="#F9A8D4" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CarrotClipart({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden>
      <path d="M28 8c4 6 4 10 2 14" stroke="#4ADE80" strokeWidth="4" strokeLinecap="round" />
      <path d="M36 8c-2 7 0 11 2 14" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />
      <path
        d="M32 18c10 8 16 22 12 34-8 4-22 2-28-8C10 32 20 22 32 18Z"
        fill="#FB923C"
        stroke="#EA580C"
        strokeWidth="2"
      />
      <path d="M26 28c6 4 12 12 14 20" stroke="#FDBA74" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function FloatingBunnies() {
  return (
    <div className="bunny-field pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {BUNNIES.map((bunny, i) => (
        <div
          key={i}
          className={`bunny-actor absolute ${bunny.anim}`}
          style={{
            top: bunny.top,
            left: bunny.left,
            width: bunny.size,
            height: bunny.size,
            opacity: bunny.opacity,
            animationDelay: bunny.delay,
            animationDuration: bunny.duration,
          }}
        >
          {i % 5 === 2 ? <CarrotClipart size={bunny.size * 0.7} /> : <RabbitClipart size={bunny.size} />}
        </div>
      ))}
      <div className="bunny-sparkle bunny-sparkle-a" />
      <div className="bunny-sparkle bunny-sparkle-b" />
      <div className="bunny-sparkle bunny-sparkle-c" />
    </div>
  );
}
