export const WEEKS = [
  { id: 1, title: 'Møt uroen',      status: 'active' },
  { id: 2, title: 'Reaktivitet',    status: 'locked' },
  { id: 3, title: 'Pust og ro',     status: 'locked' },
  { id: 4, title: 'Kroppen vet',    status: 'locked' },
  { id: 5, title: 'Mønstre',        status: 'locked' },
  { id: 6, title: 'Ressursen',      status: 'locked' },
  { id: 7, title: 'Integrasjon',    status: 'locked' },
  { id: 8, title: 'Veien videre',   status: 'locked' },
]

export const WEEK_1 = {
  id: 1,
  weekLabel: 'Uke 1 av 8',
  title: 'Møt uroen',
  subtitle: 'Bli kjent med din indre uro',
  audio: {
    src: '/audio/audio1.mp3',
    type: 'Ukens lydfil · Guidet meditasjon',
    title: 'Introduksjon til uro',
    info: 'Uroreisen, uke 1',
  },
  content: [
    { id: 1, type: 'audio',   label: 'Lydfil',      title: 'Oppmerksomhet på pust',  meta: '12 min · Oppmerksomhetstrening' },
    { id: 2, type: 'case',    label: 'Case',         title: 'Annas indre uro',         meta: 'Lese-case · 5 min' },
    { id: 3, type: 'reflect', label: 'Refleksjon',   title: 'Hva er uro for deg?',     meta: 'Skriveøvelse · 10 min' },
    { id: 4, type: 'audio',   label: 'Lydfil',       title: 'Kroppsskanning – ro',     meta: '22 min · Fordypning' },
  ],
  aboutStrong: 'Hva handler denne uken om?',
  about: 'Uro er ikke farlig – det er et signal. Denne uken blir du kjent med din egen uro uten å bekjempe den. Vi introduserer deg til Urometoden og hva forskning sier om hvordan uro oppstår og kan reguleres.',
}
