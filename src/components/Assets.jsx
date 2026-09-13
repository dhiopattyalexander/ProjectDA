// Clean SVG Vector Assets to replace raw emojis across the application

export function SvgHammer({ size = 48, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: 'drop-shadow(0 4px 12px rgba(255, 255, 255, 0.4))' }}
    >
      <defs>
        <linearGradient id="hammerHead" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#E9ECEF" />
          <stop offset="100%" stopColor="#CED4DA" />
        </linearGradient>
        <linearGradient id="hammerHandle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7D1227" />
          <stop offset="50%" stopColor="#5E0F1F" />
          <stop offset="100%" stopColor="#2A080F" />
        </linearGradient>
      </defs>
      {/* Handle */}
      <rect
        x="28"
        y="24"
        width="8"
        height="34"
        rx="4"
        transform="rotate(-25 32 41)"
        fill="url(#hammerHandle)"
        stroke="#FFFFFF"
        strokeWidth="1.5"
      />
      {/* Metal Head */}
      <rect
        x="12"
        y="10"
        width="38"
        height="18"
        rx="4"
        transform="rotate(-25 31 19)"
        fill="url(#hammerHead)"
        stroke="#FFF"
        strokeWidth="1.5"
      />
      {/* Head highlight strike line */}
      <line
        x1="16"
        y1="16"
        x2="44"
        y2="2"
        stroke="#FFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SvgSparkle({ size = 24, color = '#FFFFFF', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
    >
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
    </svg>
  )
}

export function SvgRose({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M16 4C12 4 8 7 8 11C8 16 16 22 16 22C16 22 24 16 24 11C24 7 20 4 16 4Z"
        fill="#9C1731"
        stroke="#FFFFFF"
        strokeWidth="1.5"
      />
      <circle cx="16" cy="11" r="3.5" fill="#420C17" />
      <path
        d="M16 22V29M16 25L12 23M16 27L20 25"
        stroke="#FFFFFF"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SvgHeart({ size = 24, color = '#FFFFFF', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

export function SvgCandle({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Flame */}
      <path
        d="M16 2C16 2 21 8 21 13C21 16.31 18.76 19 16 19C13.24 19 11 16.31 11 13C11 8 16 2 16 2Z"
        fill="#FFFFFF"
      />
      <path
        d="M16 7C16 7 18.5 10.5 18.5 13.5C18.5 15.5 17.38 17 16 17C14.62 17 13.5 15.5 13.5 13.5C13.5 10.5 16 7 16 7Z"
        fill="#F8F9FA"
      />
      {/* Wick */}
      <line x1="16" y1="19" x2="16" y2="24" stroke="#FFF" strokeWidth="2" />
      {/* Candle Body */}
      <rect
        x="9"
        y="24"
        width="14"
        height="22"
        rx="3"
        fill="url(#candleBody)"
        stroke="#FFFFFF"
        strokeWidth="1.5"
      />
      <defs>
        <linearGradient id="candleBody" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#9C1731" />
          <stop offset="100%" stopColor="#420C17" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function SvgEnvelope({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="2" y="4" width="20" height="16" rx="3" fill="#2A080F" stroke="#FFFFFF" strokeWidth="1.5" />
      <path d="M2 6L12 13L22 6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
