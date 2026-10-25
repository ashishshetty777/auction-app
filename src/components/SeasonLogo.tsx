import { useId } from 'react';
import { SEASON } from '@/lib/constants';

const NAVY = '#1c2659';
const CREAM = '#fff1cf';

/**
 * The season emblem, drawn in the style of the original 2026 artwork
 * (public/images/logo.jpg). Season, year and date come from SEASON, so a new
 * season only needs the constants changed.
 */
export function SeasonLogo({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const id = (name: string) => `${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  const font = { fontFamily: 'var(--font-sans), Arial, sans-serif' };

  return (
    <svg
      viewBox="0 0 904 1024"
      role="img"
      aria-label={`${SEASON.league} ${SEASON.year}, ${SEASON.short} Season ${SEASON.season}, ${SEASON.emblemDate}`}
      className={className}
    >
      <defs>
        <linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e4307c" />
          <stop offset="0.42" stopColor="#c2286f" />
          <stop offset="0.62" stopColor="#6a2a9c" />
          <stop offset="1" stopColor="#2c1868" />
        </linearGradient>
        <radialGradient id={id('glow')}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="#ffd6ec" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ff8cc6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('beam')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('turf')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9be862" />
          <stop offset="1" stopColor="#5bbd3b" />
        </linearGradient>
        <radialGradient id={id('ball')} cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#ff7a4d" />
          <stop offset="0.55" stopColor="#e2402c" />
          <stop offset="1" stopColor="#a8221a" />
        </radialGradient>
        <linearGradient id={id('blade')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f6c869" />
          <stop offset="1" stopColor="#e4a646" />
        </linearGradient>
        <clipPath id={id('shield-clip')}>
          <path d="M232 440 Q452 350 672 440 L672 575 Q672 770 452 880 Q232 770 232 575 Z" />
        </clipPath>
        <filter id={id('date-glow')} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feFlood floodColor="#ffd98a" floodOpacity="0.55" />
          <feComposite in2="b" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={id('shadow')} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#12082e" floodOpacity="0.55" />
        </filter>
      </defs>

      {/* Stadium sky */}
      <rect width="904" height="1024" fill={url('sky')} />
      <ellipse cx="452" cy="380" rx="520" ry="160" fill="#ff7fb8" opacity="0.12" />

      {/* Floodlights */}
      {[
        { x: 92, tilt: -18, beam: 'M60 90 L250 470 L340 400 Z' },
        { x: 812, tilt: 18, beam: 'M844 90 L654 470 L564 400 Z' },
      ].map(light => (
        <g key={light.x}>
          <path d={light.beam} fill={url('beam')} opacity="0.5" />
          <circle cx={light.x} cy="70" r="120" fill={url('glow')} />
          <g transform={`rotate(${light.tilt} ${light.x} 62)`}>
            {[0, 1, 2].map(row =>
              [0, 1, 2, 3, 4].map(col => (
                <circle
                  key={`${row}-${col}`}
                  cx={light.x - 52 + col * 26}
                  cy={36 + row * 26}
                  r="9"
                  fill="#fff"
                />
              )),
            )}
          </g>
        </g>
      ))}

      {/* Society line */}
      <g style={font} textAnchor="middle">
        <text
          x="452"
          y="112"
          fill="#fde8f0"
          fontSize="40"
          letterSpacing="3"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          SAMRIDDHI
        </text>
        <line x1="352" y1="126" x2="552" y2="126" stroke="#fde8f0" strokeOpacity="0.6" strokeWidth="1.5" />
        <text x="452" y="148" fill="#fde8f0" fontSize="13" letterSpacing="2.4" opacity="0.85">
          PEACE, PRESTIGE &amp; PROSPERITY
        </text>
      </g>

      {/* Crowd */}
      <g fill="#3b1a6e" opacity="0.75">
        {Array.from({ length: 24 }, (_, i) => (
          <circle key={i} cx={10 + i * 38} cy={i % 2 ? 498 : 486} r="16" />
        ))}
        <rect x="0" y="498" width="904" height="160" />
        {[40, 150, 260, 640, 760, 870].map(x => (
          <path key={x} d={`M${x} 500 l-18 -62 l10 -4 l20 60 Z`} />
        ))}
      </g>

      {/* Crossed bats */}
      {[-40, 40].map(angle => (
        <g key={angle} transform={`translate(452 590) rotate(${angle}) translate(0 -400)`} filter={url('shadow')}>
          <rect x="-20" y="0" width="40" height="300" rx="14" fill={NAVY} stroke="#fff" strokeWidth="7" />
          {[40, 80, 120, 160, 200, 240].map(y => (
            <line key={y} x1="-18" y1={y} x2="18" y2={y + 14} stroke="#33407e" strokeWidth="5" />
          ))}
          <path
            d="M-52 300 L52 300 L56 740 Q56 790 0 790 Q-56 790 -56 740 Z"
            fill={url('blade')}
            stroke={NAVY}
            strokeWidth="10"
            strokeLinejoin="round"
          />
          <path d="M-20 300 L20 300 L14 360 L-14 360 Z" fill="#c98d32" />
        </g>
      ))}

      {/* Shield */}
      <g filter={url('shadow')}>
        <path
          d="M232 440 Q452 350 672 440 L672 575 Q672 770 452 880 Q232 770 232 575 Z"
          fill={NAVY}
          stroke={NAVY}
          strokeWidth="34"
          strokeLinejoin="round"
        />
        <path
          d="M232 440 Q452 350 672 440 L672 575 Q672 770 452 880 Q232 770 232 575 Z"
          fill={url('turf')}
          stroke="#fff"
          strokeWidth="10"
          strokeLinejoin="round"
        />
        <g clipPath={url('shield-clip')} opacity="0.22">
          {Array.from({ length: 9 }, (_, i) => (
            <rect key={i} x={140 + i * 80} y="300" width="36" height="700" fill="#fff" transform="rotate(30 452 620)" />
          ))}
        </g>
      </g>

      {/* Ball with SCL lozenge */}
      <g filter={url('shadow')}>
        <circle cx="452" cy="440" r="132" fill={NAVY} />
        <circle cx="452" cy="440" r="121" fill="#fff" />
        <circle cx="452" cy="440" r="112" fill={url('ball')} />
        <path d="M355 380 Q452 330 549 380" fill="none" stroke={CREAM} strokeWidth="4" strokeDasharray="10 8" opacity="0.8" />
        <path d="M355 500 Q452 550 549 500" fill="none" stroke={CREAM} strokeWidth="4" strokeDasharray="10 8" opacity="0.8" />
        <rect x="352" y="392" width="200" height="96" rx="40" fill="#fff" />
        <text x="452" y="462" textAnchor="middle" fill={NAVY} fontSize="76" fontWeight="800" style={font} letterSpacing="-1">
          {SEASON.short}
        </text>
        <rect x="374" y="474" width="156" height="34" rx="17" fill="#fff" />
        <text x="452" y="500" textAnchor="middle" fill={NAVY} fontSize="25" fontWeight="700" style={font} letterSpacing="1">
          SEASON {SEASON.season}
        </text>
      </g>

      {/* Ribbon */}
      <g filter={url('shadow')}>
        <path
          d="M78 568 L826 568 L782 616 L826 664 L78 664 L122 616 Z"
          fill={NAVY}
          stroke="#fff"
          strokeWidth="8"
          strokeLinejoin="round"
        />
        <text
          x="452"
          y="645"
          textAnchor="middle"
          fill="#fff"
          fontSize="86"
          fontWeight="800"
          style={font}
          textLength="560"
          lengthAdjust="spacingAndGlyphs"
        >
          SAMRIDDHI
        </text>
      </g>

      {/* League bar */}
      <rect x="262" y="676" width="380" height="56" rx="6" fill="#f2792f" stroke={NAVY} strokeWidth="5" />
      <text
        x="452"
        y="716"
        textAnchor="middle"
        fill={CREAM}
        fontSize="36"
        fontWeight="700"
        style={font}
        textLength="340"
        lengthAdjust="spacingAndGlyphs"
      >
        CHAMPIONS LEAGUE
      </text>

      {/* Year */}
      <text x="452" y="806" textAnchor="middle" fill={NAVY} fontSize="54" fontWeight="800" style={font}>
        {SEASON.year}
      </text>

      {/* Auction date */}
      <text
        x="452"
        y="978"
        textAnchor="middle"
        fill="#fbe3a0"
        fontSize="84"
        fontWeight="800"
        style={font}
        filter={url('date-glow')}
      >
        {SEASON.emblemDate}
      </text>
    </svg>
  );
}
