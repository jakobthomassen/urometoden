-- Audio
INSERT INTO content_items (id, type, title, meta, r2_key) VALUES
  ('a1',  'audio', 'Introduksjon til uro',         '18 min · Uke 1', 'audio1.mp3'),
  ('a2',  'audio', 'Oppmerksomhet på pust',        '12 min · Uke 1', NULL),
  ('a3',  'audio', 'Kroppsskanning – ro',           '22 min · Uke 1', NULL),
  ('a4',  'audio', 'Å kjenne igjen reaktivitet',   '18 min · Uke 2', NULL),
  ('a5',  'audio', 'Pusteteknikk – 4-7-8',         '8 min · Uke 3',  NULL),
  ('a6',  'audio', 'Kroppsskanning – dybde',        '30 min · Uke 4', NULL),
  ('a7',  'audio', 'Mindful gange',                 '15 min · Uke 5', NULL),
  ('a8',  'audio', 'Ressursmeditasjon',             '20 min · Uke 6', NULL),
  ('a9',  'audio', 'Integrasjonsøvelse',            '18 min · Uke 7', NULL),
  ('a10', 'audio', 'Søvnmeditasjon',                '25 min · Uke 8', NULL);

-- Video
INSERT INTO content_items (id, type, title, meta) VALUES
  ('v1', 'video', 'Introduksjon til Urometoden',   '8 min · Oversikt'),
  ('v2', 'video', 'Forklaring av nervesystemet',   '12 min · Teori'),
  ('v3', 'video', 'Uro og søvn',                   '10 min · Teori');

-- Case
INSERT INTO content_items (id, type, title, meta, abstract, body) VALUES
  ('c1', 'case', 'Annas indre uro', 'Lese-case · 5 min',
    'Anna er 34 år og har levd med en vedvarende indre uro så lenge hun kan huske. Fra utsiden ser livet hennes vellykket ut – fast jobb, familie, venner. Innsiden er en annen historie.',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

Anna beskriver uroen som «en motor som aldri slår seg av». Om morgenen starter den før hun er ordentlig våken – en liste over ting som kan gå galt, en gjennomgang av gårsdagens samtaler. Hun sjekker telefonen gjentatte ganger uten å egentlig vite hva hun leter etter.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

I terapisamtalene sine beskriver Anna en barndom der det å «holde seg i bakgrunnen» føltes trygt. Uroen ble en strategi – ved alltid å forvente det verste, slapp hun å bli overrasket. Problemet er at strategien ikke har noen av-knapp.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.'
  ),
  ('c2', 'case', 'Marias reaktive mønster', 'Lese-case · 5 min',
    'Maria er 41 år og oppdager gjennom Urometoden at uroen hennes ikke er konstant – den eksploderer i korte, intense episoder utløst av svært spesifikke situasjoner.',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

Maria fungerer godt i hverdagen – kanskje for godt. Hun er effektiv, løsningsorientert og alltid tilgjengelig for andre. Det er først når noen avbryter henne midt i en oppgave, eller ikke svarer på meldingen hennes innen rimelig tid, at det smeller.

Neque porro quisquam est qui dolorem ipsum quia dolor sit amet consectetur adipisci velit. Ut labore et dolore magnam aliquam quaerat voluptatem.

I journalen sin skriver Maria at reaksjonene hennes «er uforholdsmessige». Hun vet det i etterkant, men i øyeblikket føles det som om noe overtar. Urometoden hjelper henne å identifisere det kroppslige varselet som kommer sekunder før – en stramhet bak øynene, et lett press i brystet.'
  ),
  ('c3', 'case', 'Håvards søvnproblemer', 'Lese-case · 7 min',
    'Håvard er 52 år. Han sover ikke. Ikke fordi han ikke er trøtt – han er alltid trøtt – men fordi tankene hans ikke lar ham. Han har prøvd alt. Nesten.',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint.

Håvard legger seg klokken ti. Kroppen er tung. Han lukker øynene og i løpet av minutter er tankene i full gang – jobben, en konflikt fra forrige uke, hva han burde ha sagt, hva som kan gå galt i morgen.

Nam libero tempore cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus omnis voluptas assumenda est omnis dolor repellendus.

Urometoden introduserer Håvard til konseptet «bekymringsvindu» – en begrenset, definert tid om ettermiddagen der han aktivt får lov til å bekymre seg. Tanken er å trene hjernen til å utsette bekymringen fremfor å undertrykke den. Det tar tid. Det funker.

Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae itaque earum rerum hic tenetur.'
  ),
  ('c4', 'case', 'Lisas prestasjonsangst', 'Lese-case · 6 min',
    'Lisa er 27 år og nyutdannet. På papiret er hun godt rustet. I praksis lammes hun av frykten for å gjøre feil – noe som gjør at hun gjør nettopp det.',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.

Lisa ble beskrevet som «veldig flink» hele livet. Karakterer, skryt, forventninger. Problemet er at «veldig flink» ikke er en identitet man kan hvile i – det er en standard man hele tiden må forsvare.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta.

I Urometoden jobber Lisa med å skille mellom det å gjøre noe godt og det å være noe godt. Uroen hennes er tett koblet til selvbilde, ikke til faktisk risiko. Når hun begynner å se det skillet, løsner noe.'
  ),
  ('c5', 'case', 'Tomases kroppsuro', 'Lese-case · 5 min',
    'Tomas er 38 år og opplever uroen sin primært som fysisk – ikke som tanker, men som en konstant rastløshet i kroppen han ikke vet hva han skal gjøre med.',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi morbi tempus iaculis urna id volutpat lacus laoreet non. Morbi quis commodo odio aenean sed adipiscing diam.

Tomas sitter ikke stille. Ikke av valg – av nødvendighet. Beina må bevege seg, han reiser seg fra stolen gjentatte ganger, han trenger å gå. I møter er det synlig nok til at kolleger har kommentert det.

Viverra ipsum nunc aliquet bibendum enim facilisis gravida neque convallis. A lacus vestibulum sed arcu non odio euismod lacinia at quis risus sed vulputate odio ut enim blandit.

Urometoden tilnærmer seg Tomases uro via kroppen – ikke via tankene. Kroppsskanning, bevegelsesøvelser og pustepraksis gir ham et vokabular og et verktøysett for det han alltid har kjent men aldri visst hva han skulle kalle.'
  );

-- Reflect
INSERT INTO content_items (id, type, title, meta, prompt) VALUES
  ('r1', 'reflect', 'Hva er uro for deg?', 'Skriveøvelse · 10 min',
    'Uro oppleves forskjellig fra person til person. For noen sitter den i magen som en konstant summing; for andre dukker den opp som rastløse tanker om natten eller en vag følelse av at noe ikke er som det skal.

Ta deg tid til å sitte med spørsmålet. Ikke forsøk å analysere – bare beskriv. Hvor i kroppen merker du det? Når er det verst? Hva kaller du det når du snakker med deg selv om det?'
  ),
  ('r2', 'reflect', 'Hva trigget deg i dag?', 'Skriveøvelse · 10 min',
    'Vi blir trigget mange ganger om dagen uten å legge merke til det. En kommentar fra noen, en e-post du ikke fikk svar på, en lyd, en situasjon som minnet deg om noe gammelt.

Tenk tilbake på dagen. Var det ett øyeblikk der uroen økte merkbart? Hva skjedde rett i forkant? Forsøk å beskrive situasjonen så konkret som mulig – ikke hvordan du burde ha reagert, men hvordan du faktisk reagerte.'
  ),
  ('r3', 'reflect', 'Kroppens signaler', 'Skriveøvelse · 15 min',
    'Kroppen registrerer uro lenge før tankene fanger den opp. Stramhet i kjeven, et stramt bryst, overfladisk pust, uro i beina – disse er signaler, ikke tilfeldigheter.

Slukt øynene i ett minutt og skann kroppen fra topp til tå. Legg merke til hva du finner uten å forsøke å endre det. Skriv deretter ned: Hva la du merke til? Hva overrasket deg? Har du kjent dette tidligere uten å koble det til uro?'
  ),
  ('r4', 'reflect', 'Takknemlighet og ro', 'Skriveøvelse · 10 min',
    'Takknemlighet er ikke det samme som å late som at alt er bra. Det er evnen til å se det som faktisk er til stede – selv midt i det vanskelige.

List opp tre til fem ting fra den siste uken som du er genuint takknemlig for. De behøver ikke å være store. Skriv deretter ett avsnitt om en av dem: hva betyr den for deg, og hvordan kjennes det i kroppen når du lar deg kjenne på den?'
  ),
  ('r5', 'reflect', 'Mønstre jeg ser', 'Skriveøvelse · 12 min',
    'Uro har gjerne faste spor den går i. Kanskje er du alltid mest urolig søndag kveld. Kanskje utløses det av bestemte mennesker, krav eller situasjoner. Kanskje reagerer du alltid på samme måte – trekker deg tilbake, overarbeider, blir irritabel.

Skriv om ett mønster du har lagt merke til hos deg selv. Beskriv det konkret: når oppstår det, hva gjør du, og hva skjer etterpå? Du trenger ikke å løse noe – bare se det tydelig.'
  ),
  ('r6', 'reflect', 'Brev til uroen', 'Skriveøvelse · 20 min',
    'Dette er en av de kraftigste øvelsene i Urometoden. Istedenfor å bekjempe uroen, inviterer vi den til dialog.

Skriv et brev direkte til uroen din – som om den var en person eller et vesen. Fortell den hva du tenker om den, hva den har kostet deg, og hva du kanskje har lært av den. Du kan være sint, lei, takknemlig – alt er lov. Avslutt med å spørre den: «Hva vil du egentlig fortelle meg?»'
  );

-- Week 1 content (position order matches current WEEK_1.content)
INSERT INTO week_content (week_id, content_id, position, meta) VALUES
  (1, 'a2', 1, '12 min · Oppmerksomhetstrening'),
  (1, 'c1', 2, NULL),
  (1, 'r1', 3, NULL),
  (1, 'a3', 4, '22 min · Fordypning');
