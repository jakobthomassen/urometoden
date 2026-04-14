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
      {
        id: 'c1', title: 'Annas indre uro', meta: 'Lese-case · 5 min',
        abstract: 'Anna er 34 år og har levd med en vedvarende indre uro så lenge hun kan huske. Fra utsiden ser livet hennes vellykket ut – fast jobb, familie, venner. Innsiden er en annen historie.',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.\n\nAnna beskriver uroen som «en motor som aldri slår seg av». Om morgenen starter den før hun er ordentlig våken – en liste over ting som kan gå galt, en gjennomgang av gårsdagens samtaler. Hun sjekker telefonen gjentatte ganger uten å egentlig vite hva hun leter etter.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nI terapisamtalene sine beskriver Anna en barndom der det å «holde seg i bakgrunnen» føltes trygt. Uroen ble en strategi – ved alltid å forvente det verste, slapp hun å bli overrasket. Problemet er at strategien ikke har noen av-knapp.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
      },
      {
        id: 'c2', title: 'Marias reaktive mønster', meta: 'Lese-case · 5 min',
        abstract: 'Maria er 41 år og oppdager gjennom Urometoden at uroen hennes ikke er konstant – den eksploderer i korte, intense episoder utløst av svært spesifikke situasjoner.',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.\n\nMaria fungerer godt i hverdagen – kanskje for godt. Hun er effektiv, løsningsorientert og alltid tilgjengelig for andre. Det er først når noen avbryter henne midt i en oppgave, eller ikke svarer på meldingen hennes innen rimelig tid, at det smeller.\n\nNeque porro quisquam est qui dolorem ipsum quia dolor sit amet consectetur adipisci velit. Ut labore et dolore magnam aliquam quaerat voluptatem.\n\nI journalen sin skriver Maria at reaksjonene hennes «er uforholdsmessige». Hun vet det i etterkant, men i øyeblikket føles det som om noe overtar. Urometoden hjelper henne å identifisere det kroppslige varselet som kommer sekunder før – en stramhet bak øynene, et lett press i brystet.',
      },
      {
        id: 'c3', title: 'Håvards søvnproblemer', meta: 'Lese-case · 7 min',
        abstract: 'Håvard er 52 år. Han sover ikke. Ikke fordi han ikke er trøtt – han er alltid trøtt – men fordi tankene hans ikke lar ham. Han har prøvd alt. Nesten.',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint.\n\nHåvard legger seg klokken ti. Kroppen er tung. Han lukker øynene og i løpet av minutter er tankene i full gang – jobben, en konflikt fra forrige uke, hva han burde ha sagt, hva som kan gå galt i morgen.\n\nNam libero tempore cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus omnis voluptas assumenda est omnis dolor repellendus.\n\nUrometoden introduserer Håvard til konseptet «bekymringsvindu» – en begrenset, definert tid om ettermiddagen der han aktivt får lov til å bekymre seg. Tanken er å trene hjernen til å utsette bekymringen fremfor å undertrykke den. Det tar tid. Det funker.\n\nTemporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae itaque earum rerum hic tenetur.',
      },
      {
        id: 'c4', title: 'Lisas prestasjonsangst', meta: 'Lese-case · 6 min',
        abstract: 'Lisa er 27 år og nyutdannet. På papiret er hun godt rustet. I praksis lammes hun av frykten for å gjøre feil – noe som gjør at hun gjør nettopp det.',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.\n\nLisa ble beskrevet som «veldig flink» hele livet. Karakterer, skryt, forventninger. Problemet er at «veldig flink» ikke er en identitet man kan hvile i – det er en standard man hele tiden må forsvare.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta.\n\nI Urometoden jobber Lisa med å skille mellom det å gjøre noe godt og det å være noe godt. Uroen hennes er tett koblet til selvbilde, ikke til faktisk risiko. Når hun begynner å se det skillet, løsner noe.',
      },
      {
        id: 'c5', title: 'Tomases kroppsuro', meta: 'Lese-case · 5 min',
        abstract: 'Tomas er 38 år og opplever uroen sin primært som fysisk – ikke som tanker, men som en konstant rastløshet i kroppen han ikke vet hva han skal gjøre med.',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi morbi tempus iaculis urna id volutpat lacus laoreet non. Morbi quis commodo odio aenean sed adipiscing diam.\n\nTomas sitter ikke stille. Ikke av valg – av nødvendighet. Beina må bevege seg, han reiser seg fra stolen gjentatte ganger, han trenger å gå. I møter er det synlig nok til at kolleger har kommentert det.\n\nViverra ipsum nunc aliquet bibendum enim facilisis gravida neque convallis. A lacus vestibulum sed arcu non odio euismod lacinia at quis risus sed vulputate odio ut enim blandit.\n\nUrometoden tilnærmer seg Tomases uro via kroppen – ikke via tankene. Kroppsskanning, bevegelsesøvelser og pustepraksis gir ham et vokabular og et verktøysett for det han alltid har kjent men aldri visst hva han skulle kalle.',
      },
    ],
  },
  {
    type: 'reflect',
    label: 'Refleksjon',
    tag: 'Refleksjon',
    items: [
      {
        id: 'r1', title: 'Hva er uro for deg?', meta: 'Skriveøvelse · 10 min',
        prompt: 'Uro oppleves forskjellig fra person til person. For noen sitter den i magen som en konstant summing; for andre dukker den opp som rastløse tanker om natten eller en vag følelse av at noe ikke er som det skal.\n\nTa deg tid til å sitte med spørsmålet. Ikke forsøk å analysere – bare beskriv. Hvor i kroppen merker du det? Når er det verst? Hva kaller du det når du snakker med deg selv om det?',
      },
      {
        id: 'r2', title: 'Hva trigget deg i dag?', meta: 'Skriveøvelse · 10 min',
        prompt: 'Vi blir trigget mange ganger om dagen uten å legge merke til det. En kommentar fra noen, en e-post du ikke fikk svar på, en lyd, en situasjon som minnet deg om noe gammelt.\n\nTenk tilbake på dagen. Var det ett øyeblikk der uroen økte merkbart? Hva skjedde rett i forkant? Forsøk å beskrive situasjonen så konkret som mulig – ikke hvordan du burde ha reagert, men hvordan du faktisk reagerte.',
      },
      {
        id: 'r3', title: 'Kroppens signaler', meta: 'Skriveøvelse · 15 min',
        prompt: 'Kroppen registrerer uro lenge før tankene fanger den opp. Stramhet i kjeven, et stramt bryst, overfladisk pust, uro i beina – disse er signaler, ikke tilfeldigheter.\n\nSlutt øynene i ett minutt og skann kroppen fra topp til tå. Legg merke til hva du finner uten å forsøke å endre det. Skriv deretter ned: Hva la du merke til? Hva overrasket deg? Har du kjent dette tidligere uten å koble det til uro?',
      },
      {
        id: 'r4', title: 'Takknemlighet og ro', meta: 'Skriveøvelse · 10 min',
        prompt: 'Takknemlighet er ikke det samme som å late som at alt er bra. Det er evnen til å se det som faktisk er til stede – selv midt i det vanskelige.\n\nList opp tre til fem ting fra den siste uken som du er genuint takknemlig for. De behøver ikke å være store. Skriv deretter ett avsnitt om en av dem: hva betyr den for deg, og hvordan kjennes det i kroppen når du lar deg kjenne på den?',
      },
      {
        id: 'r5', title: 'Mønstre jeg ser', meta: 'Skriveøvelse · 12 min',
        prompt: 'Uro har gjerne faste spor den går i. Kanskje er du alltid mest urolig søndag kveld. Kanskje utløses det av bestemte mennesker, krav eller situasjoner. Kanskje reagerer du alltid på samme måte – trekker deg tilbake, overarbeider, blir irritabel.\n\nSkriv om ett mønster du har lagt merke til hos deg selv. Beskriv det konkret: når oppstår det, hva gjør du, og hva skjer etterpå? Du trenger ikke å løse noe – bare se det tydelig.',
      },
      {
        id: 'r6', title: 'Brev til uroen', meta: 'Skriveøvelse · 20 min',
        prompt: 'Dette er en av de kraftigste øvelsene i Urometoden. Istedenfor å bekjempe uroen, inviterer vi den til dialog.\n\nSkriv et brev direkte til uroen din – som om den var en person eller et vesen. Fortell den hva du tenker om den, hva den har kostet deg, og hva du kanskje har lært av den. Du kan være sint, lei, takknemlig – alt er lov. Avslutt med å spørre den: «Hva vil du egentlig fortelle meg?»',
      },
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
