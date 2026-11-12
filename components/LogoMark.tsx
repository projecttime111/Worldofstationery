/** World of Stationery mark (from assets/logos/world-of-stationery-mark.svg), inlined so it paints with the HTML. */
export function LogoMark({ size = 52, id, label }: { size?: number; id: string; label?: string }) {
  const clip = `wos-clip-${id}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      className="shrink-0"
    >
      <defs>
        <clipPath id={clip}>
          <circle cx="80" cy="80" r="60" />
        </clipPath>
      </defs>
      <circle cx="80" cy="80" r="60" fill="#1B3A6B" />
      <g clipPath={`url(#${clip})`} fill="none" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="4">
        <line x1="10" y1="56" x2="150" y2="56" />
        <line x1="10" y1="80" x2="150" y2="80" />
        <line x1="10" y1="104" x2="150" y2="104" />
        <ellipse cx="80" cy="80" rx="27" ry="60" />
      </g>
      <g transform="rotate(-35 80 80)" stroke="#FFFFFF" strokeWidth="4" paintOrder="stroke">
        <rect x="16" y="71" width="100" height="18" rx="2" fill="#F2B33D" />
        <rect x="6" y="71" width="12" height="18" rx="4" fill="#E58A7B" />
        <rect x="16" y="71" width="7" height="18" fill="#C9CED6" />
        <polygon points="116,71 148,80 116,89" fill="#F3D9B1" />
      </g>
      <g transform="rotate(-35 80 80)">
        <polygon points="139,77.4 148,80 139,82.6" fill="#1A1D21" />
      </g>
    </svg>
  );
}

/**
 * Yamuna Enterprises mark (from assets/logos/yamuna-enterprises-mark.svg).
 * `onDark` is for the indigo brand card: the nib gets a white outline and the river wave turns white.
 * Pass no label when the mark sits next to the company name (it is then decorative).
 */
export function YamunaMark({ size = 28, label, onDark = false }: { size?: number; label?: string; onDark?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      className="shrink-0"
    >
      <path
        d="M80 150 L34 82 C34 50 55 24 80 8 C105 24 126 50 126 82 Z"
        fill="#D7262E"
        stroke={onDark ? "#FFFFFF" : undefined}
        strokeWidth={onDark ? 5 : undefined}
        strokeLinejoin="round"
      />
      <g fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round">
        <path d="M80 134 L80 92" />
        <path d="M80 92 L59 52" />
        <path d="M80 92 L101 52" />
      </g>
      <circle cx="80" cy="92" r="9" fill="#FFFFFF" />
      {onDark ? (
        <path d="M8 146 q18 -12 36 0 t36 0 t36 0 t36 0" fill="none" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" />
      ) : (
        <>
          <path d="M8 146 q18 -12 36 0 t36 0 t36 0 t36 0" fill="none" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="round" />
          <path d="M8 146 q18 -12 36 0 t36 0 t36 0 t36 0" fill="none" stroke="#2B2A7E" strokeWidth="7" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
