import { LogoMark } from "./LogoMark";

type Chip = { value: string; label: string };

/**
 * Illustrated desk flat-lay for the hero: notebook, pencils, diary, billing roll,
 * keyboard corner and sticky note, with the World of Stationery mark as a badge in the middle.
 * Motion (CSS only, see globals.css): the chips float, and one pencil draws a wavy line once.
 * All motion stops under prefers-reduced-motion.
 */
export function HeroScene({ chips, className = "" }: { chips: Chip[]; className?: string }) {
  const positions = [
    "top-[6%] left-[4%]",
    "top-[42%] right-[3%]",
    "bottom-[5%] left-[34%]",
  ];
  return (
    <div className={`relative overflow-hidden rounded-photo border border-line bg-white ${className}`}>
      <svg
        viewBox="0 0 480 400"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
        className="absolute inset-0 h-full w-full"
      >
        <g stroke="#1B3A6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Open notebook */}
          <g transform="rotate(-6 130 100)">
            <rect x="28" y="30" width="204" height="140" rx="9" fill="#1B3A6B" />
            <rect x="36" y="36" width="94" height="128" rx="3" fill="#FFFFFF" />
            <rect x="130" y="36" width="94" height="128" rx="3" fill="#FFFFFF" />
            <g stroke="#D5DDEA">
              <line x1="46" y1="58" x2="120" y2="58" />
              <line x1="46" y1="74" x2="120" y2="74" />
              <line x1="46" y1="90" x2="120" y2="90" />
              <line x1="46" y1="106" x2="120" y2="106" />
              <line x1="46" y1="122" x2="120" y2="122" />
              <line x1="140" y1="58" x2="214" y2="58" />
              <line x1="140" y1="74" x2="214" y2="74" />
              <line x1="140" y1="90" x2="214" y2="90" />
            </g>
            <path
              className="hero-draw"
              pathLength={1}
              d="M142 120 q8 -10 16 0 t16 0 t16 0 t16 0"
              fill="none"
              stroke="#1B3A6B"
              strokeWidth="2.5"
            />
            {/* The drawing pencil: outer group moves, inner group sets the angle */}
            <g className="hero-pencil">
              <g transform="rotate(-40 206 120)">
                <rect x="212" y="113" width="74" height="14" rx="2" fill="#F2B33D" />
                <rect x="284" y="113" width="10" height="14" rx="3" fill="#E58A7B" />
                <rect x="279" y="113" width="6" height="14" fill="#C9CED6" />
                <path d="M212 113 L196 120 L212 127 Z" fill="#F3D9B1" />
                <path d="M201 118 L196 120 L201 122 Z" fill="#1A1D21" />
              </g>
            </g>
          </g>

          {/* Diary */}
          <g transform="rotate(8 360 100)">
            <path d="M330 168 L330 190 L337 184 L344 190 L344 168 Z" fill="#E58A7B" />
            <rect x="306" y="24" width="112" height="146" rx="10" fill="#1B3A6B" />
            <line x1="320" y1="24" x2="320" y2="170" stroke="#3A5A8C" />
            <rect x="334" y="54" width="52" height="18" rx="3" fill="#F7F5EF" />
            <rect x="398" y="22" width="8" height="150" rx="2" fill="#F2B33D" />
          </g>

          {/* Loose pencil */}
          <g transform="rotate(14 250 336)">
            <rect x="196" y="330" width="96" height="13" rx="2" fill="#FFFFFF" />
            <rect x="290" y="330" width="10" height="13" rx="3" fill="#1B3A6B" />
            <path d="M196 330 L180 336.5 L196 343 Z" fill="#F3D9B1" />
          </g>

          {/* Billing roll with receipt */}
          <path d="M104 262 H140 V372 l-4.5 6 -4.5 -6 -4.5 6 -4.5 -6 -4.5 6 -4.5 -6 -4.5 6 -4.5 -6 Z" fill="#FFFFFF" />
          <g stroke="#D5DDEA">
            <line x1="112" y1="318" x2="132" y2="318" />
            <line x1="112" y1="330" x2="126" y2="330" />
            <line x1="112" y1="342" x2="132" y2="342" />
          </g>
          <circle cx="96" cy="262" r="42" fill="#FFFFFF" />
          <circle cx="96" cy="262" r="26" fill="#F7F5EF" stroke="#E6E2D6" />
          <circle cx="96" cy="262" r="11" fill="#F2B33D" />

          {/* Keyboard corner, running off the desk */}
          <g transform="rotate(-10 420 320)">
            <rect x="330" y="262" width="210" height="150" rx="12" fill="#FFFFFF" />
            <g fill="#E6E2D6" stroke="none">
              <rect x="344" y="276" width="22" height="18" rx="3" />
              <rect x="372" y="276" width="22" height="18" rx="3" />
              <rect x="400" y="276" width="22" height="18" rx="3" />
              <rect x="428" y="276" width="22" height="18" rx="3" />
              <rect x="456" y="276" width="22" height="18" rx="3" />
              <rect x="344" y="300" width="32" height="18" rx="3" />
              <rect x="382" y="300" width="22" height="18" rx="3" />
              <rect x="410" y="300" width="22" height="18" rx="3" />
              <rect x="438" y="300" width="22" height="18" rx="3" />
              <rect x="344" y="324" width="40" height="18" rx="3" />
              <rect x="390" y="324" width="22" height="18" rx="3" />
              <rect x="418" y="324" width="22" height="18" rx="3" />
            </g>
            <rect x="372" y="348" width="96" height="18" rx="3" fill="#F2B33D" />
          </g>

          {/* Sticky note */}
          <g transform="rotate(-8 300 250)">
            <path d="M266 216 H334 V268 L316 286 H266 Z" fill="#F2B33D" />
            <path d="M334 268 L316 268 L316 286" fill="#F7D07A" />
            <line x1="276" y1="234" x2="318" y2="234" stroke="#FFFFFF" />
            <line x1="276" y1="248" x2="306" y2="248" stroke="#FFFFFF" />
          </g>

          {/* Centre badge with the World of Stationery mark */}
          <circle cx="240" cy="200" r="62" fill="#FFFFFF" stroke="#E6E2D6" strokeWidth="8" />
        </g>
        {/* The shared mark renders its own <svg>, which nests fine inside this one. */}
        <g transform="translate(184 144) scale(0.7)">
          <LogoMark id="hero" size={160} />
        </g>
      </svg>

      {chips.map((chip, i) => (
        <div
          key={chip.value}
          className={`hero-chip absolute ${positions[i]} flex items-baseline gap-1.5 rounded-[14px] bg-white px-3 py-2 shadow-[0_8px_24px_rgba(27,58,107,0.18)] sm:px-3.5`}
          style={{ animationDelay: `${-i * 2}s` }}
        >
          <span className="font-heading text-lg leading-none font-extrabold text-navy sm:text-[22px]">{chip.value}</span>
          <span className="text-[13px] font-semibold text-body sm:text-sm">{chip.label}</span>
        </div>
      ))}
    </div>
  );
}
