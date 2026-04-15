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
    type: 'Ukens lydfil',
    title: 'Hvordan kan jeg bruke uro som en ressurs?',
    info: 'Uroreisen, uke 1',
  },
  content: [
    { id: 1, type: 'audio',   label: 'Lydfil',      title: 'Oppmerksomhet på pust',  meta: '12 min · Oppmerksomhetstrening' },
    { id: 2, type: 'case',    label: 'Case',         title: 'Annas indre uro',         meta: 'Lese-case · 5 min', abstract: 'Anna er 34 år og har levd med en vedvarende indre uro så lenge hun kan huske. Fra utsiden ser livet hennes vellykket ut – fast jobb, familie, venner. Innsiden er en annen historie.', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.\n\nAnna beskriver uroen som «en motor som aldri slår seg av». Om morgenen starter den før hun er ordentlig våken – en liste over ting som kan gå galt, en gjennomgang av gårsdagens samtaler. Hun sjekker telefonen gjentatte ganger uten å egentlig vite hva hun leter etter.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nI terapisamtalene sine beskriver Anna en barndom der det å «holde seg i bakgrunnen» føltes trygt. Uroen ble en strategi – ved alltid å forvente det verste, slapp hun å bli overrasket. Problemet er at strategien ikke har noen av-knapp.' },
    { id: 3, type: 'reflect', label: 'Refleksjon',   title: 'Hva er uro for deg?',     meta: 'Skriveøvelse · 10 min', prompt: 'Uro oppleves forskjellig fra person til person. For noen sitter den i magen som en konstant summing; for andre dukker den opp som rastløse tanker om natten eller en vag følelse av at noe ikke er som det skal.\n\nTa deg tid til å sitte med spørsmålet. Ikke forsøk å analysere – bare beskriv. Hvor i kroppen merker du det? Når er det verst? Hva kaller du det når du snakker med deg selv om det?' },
    { id: 4, type: 'audio',   label: 'Lydfil',       title: 'Kroppsskanning – ro',     meta: '22 min · Fordypning' },
  ],
  aboutStrong: 'Hva handler denne uken om?',
  about: 'Uro er ikke farlig – det er et signal. Denne uken blir du kjent med din egen uro uten å bekjempe den. Vi introduserer deg til Urometoden og hva forskning sier om hvordan uro oppstår og kan reguleres.',
}
