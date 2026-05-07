export const CARD_ICON_LABELS = {
  'user':          'Person',
  'calendar-days': 'Kalender',
  'info':          'Info',
  'layers':        'Lag',
  'heart':         'Hjerte',
  'book':          'Bok',
  'star':          'Stjerne',
  'compass':       'Kompass',
  'leaf':          'Blad',
  'sun':           'Sol',
  'moon':          'Måne',
  'chat':          'Chat',
  'video':         'Video',
  'award':         'Premie',
  'music':         'Musikk',
  'home':          'Hjem',
}

export const CARD_ICON_KEYS = Object.keys(CARD_ICON_LABELS)

function Svg({ size = 20, children, ...props }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  )
}

const ICONS = {
  'user': p => <Svg {...p}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" /></Svg>,
  'calendar-days': p => (
    <Svg {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="8" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="19" r="1" fill="currentColor" stroke="none" />
    </Svg>
  ),
  'info': p => <Svg {...p}><circle cx="12" cy="12" r="9" /><line x1="12" y1="16" x2="12" y2="12" /><circle cx="12" cy="8" r="0.5" fill="currentColor" stroke="none" /></Svg>,
  'layers': p => (
    <Svg {...p}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </Svg>
  ),
  'heart': p => <Svg {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></Svg>,
  'book': p => <Svg {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></Svg>,
  'star': p => <Svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></Svg>,
  'compass': p => <Svg {...p}><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></Svg>,
  'leaf': p => (
    <Svg {...p}>
      <path d="M17 8C8 10 5.9 16.17 3.82 22" />
      <path d="M20.49 3C20.49 3 13.49 2.5 9 8c-2.5 3-2.5 6.5-1.5 9" />
    </Svg>
  ),
  'sun': p => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </Svg>
  ),
  'moon': p => <Svg {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></Svg>,
  'chat': p => <Svg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Svg>,
  'video': p => <Svg {...p}><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></Svg>,
  'award': p => <Svg {...p}><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" /></Svg>,
  'music': p => <Svg {...p}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></Svg>,
  'home': p => <Svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></Svg>,
}

export function CardIcon({ name, size = 20, ...props }) {
  const Comp = ICONS[name] ?? ICONS['info']
  return <Comp size={size} {...props} />
}
