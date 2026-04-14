export const LIBRARY_SECTIONS = [
  {
    type: 'audio',
    label: 'Lydfiler',
    tag: 'Lydfil',
    items: [
      { id: 'a1',  title: 'Introduksjon til uro',         meta: '18 min · Uke 1' },
      { id: 'a2',  title: 'Oppmerksomhet på pust',        meta: '12 min · Uke 1' },
      { id: 'a3',  title: 'Kroppsskanning – ro',           meta: '22 min · Uke 1' },
      { id: 'a4',  title: 'Å kjenne igjen reaktivitet',   meta: '18 min · Uke 2' },
      { id: 'a5',  title: 'Pusteteknikk – 4-7-8',         meta: '8 min · Uke 3'  },
      { id: 'a6',  title: 'Kroppsskanning – dybde',        meta: '30 min · Uke 4' },
      { id: 'a7',  title: 'Mindful gange',                 meta: '15 min · Uke 5' },
      { id: 'a8',  title: 'Ressursmeditasjon',             meta: '20 min · Uke 6' },
      { id: 'a9',  title: 'Integrasjonsøvelse',            meta: '18 min · Uke 7' },
      { id: 'a10', title: 'Søvnmeditasjon',                meta: '25 min · Uke 8' },
    ],
  },
  {
    type: 'case',
    label: 'Case-filer',
    tag: 'Case',
    items: [
      { id: 'c1', title: 'Annas indre uro',               meta: 'Lese-case · 5 min' },
      { id: 'c2', title: 'Marias reaktive mønster',       meta: 'Lese-case · 5 min' },
      { id: 'c3', title: 'Håvards søvnproblemer',         meta: 'Lese-case · 7 min' },
      { id: 'c4', title: 'Lisas prestasjonsangst',        meta: 'Lese-case · 6 min' },
      { id: 'c5', title: 'Tomases kroppsuro',             meta: 'Lese-case · 5 min' },
    ],
  },
  {
    type: 'reflect',
    label: 'Refleksjon',
    tag: 'Refleksjon',
    items: [
      { id: 'r1', title: 'Hva er uro for deg?',           meta: 'Skriveøvelse · 10 min' },
      { id: 'r2', title: 'Hva trigget deg i dag?',        meta: 'Skriveøvelse · 10 min' },
      { id: 'r3', title: 'Kroppens signaler',              meta: 'Skriveøvelse · 15 min' },
      { id: 'r4', title: 'Takknemlighet og ro',            meta: 'Skriveøvelse · 10 min' },
      { id: 'r5', title: 'Mønstre jeg ser',                meta: 'Skriveøvelse · 12 min' },
      { id: 'r6', title: 'Brev til uroen',                 meta: 'Skriveøvelse · 20 min' },
    ],
  },
  {
    type: 'video',
    label: 'Video',
    tag: 'Video',
    items: [
      { id: 'v1', title: 'Introduksjon til Urometoden',   meta: '8 min · Oversikt' },
      { id: 'v2', title: 'Forklaring av nervesystemet',   meta: '12 min · Teori'   },
      { id: 'v3', title: 'Uro og søvn',                   meta: '10 min · Teori'   },
    ],
  },
]

export const FILTER_OPTIONS = [
  { value: 'all',     label: 'Alle' },
  { value: 'audio',   label: 'Lydfiler' },
  { value: 'case',    label: 'Case' },
  { value: 'reflect', label: 'Refleksjon' },
  { value: 'video',   label: 'Video' },
]
