// UI display config for content types — not fetched from DB
export const SECTION_META = {
  audio:   { label: 'Lydfiler',   tag: 'Lydfil'     },
  case:    { label: 'Case-filer', tag: 'Case'        },
  reflect: { label: 'Refleksjon', tag: 'Refleksjon'  },
  video:   { label: 'Video',      tag: 'Video'       },
}

export const FILTER_OPTIONS = [
  { value: 'all',     label: 'Alle'       },
  { value: 'audio',   label: 'Lydfiler'   },
  { value: 'case',    label: 'Case'       },
  { value: 'reflect', label: 'Refleksjon' },
  { value: 'video',   label: 'Video'      },
]
