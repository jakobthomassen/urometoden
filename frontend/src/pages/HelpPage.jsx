import { useState, useEffect } from 'react'
import styles from './HelpPage.module.css'

const TABS = ['Hjelp og støtte', 'Personvern']

function FaqItem({ q, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={styles.faqItem}>
      <button className={styles.faqQ} onClick={() => setOpen(o => !o)}>
        <span>{q}</span>
        <span className={styles.faqChevron}>{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className={styles.faqA}>{children}</div>}
    </div>
  )
}

function HjelpSection() {
  return (
    <div className={styles.content}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Ofte stilte spørsmål</h2>
        <div className={styles.faqList}>
          <FaqItem q="Hvordan fungerer de 8 ukene?">
            Kurset er delt inn i 8 uker. En ny uke låses opp 5 dager etter at du starter den forrige, kl. 10:00 norsk tid. Hver uke inneholder lydfiler, lesecase og refleksjonsoppgaver som du arbeider gjennom i ditt eget tempo.
          </FaqItem>
          <FaqItem q="Hva er forskjellen på prøveperiode og medlemskap?">
            Prøveperioden gir deg 7 dager full tilgang til alt innhold — gratis. Et aktivt medlemskap gir ubegrenset tilgang i abonnementsperioden. Begge gir identisk innhold og funksjonalitet.
          </FaqItem>
          <FaqItem q="Hva skjer når prøveperioden eller medlemskapet utløper?">
            Du beholder tilgang til dashbordet og Dagens tanke, men Reisen og Bibliotek låses. Fremdriften din er lagret og tilgjengelig igjen ved fornyelse.
          </FaqItem>
          <FaqItem q="Hvordan nullstiller jeg kursfremgangen min?">
            Åpne profilmenyen (avatar øverst til høyre) og klikk <strong>Nullstill kursdata</strong>. Dette fjerner lokal fremdrift, refleksjonstekst og besøkshistorikk. Handlingen kan ikke angres.
          </FaqItem>
          <FaqItem q="Støtter dere Apple Sign-In?">
            Ikke ennå. Apple Sign-In er planlagt og vil bli tilgjengelig i en fremtidig oppdatering. Foreløpig brukes Google-innlogging.
          </FaqItem>
          <FaqItem q="Kurset fungerer ikke som forventet — hva gjør jeg?">
            Prøv å laste siden på nytt. Hvis problemet vedvarer, send en e-post til oss med en kort beskrivelse av hva som skjer og hvilken nettleser du bruker.
          </FaqItem>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Kontakt</h2>
        <p className={styles.bodyText}>
          Har du spørsmål som ikke er dekket over, eller trenger du hjelp med kontoen din? Send oss en e-post.
        </p>
        <a className={styles.contactLink} href="mailto:hjelp@urometoden.no">
          hjelp@urometoden.no
        </a>
      </div>
    </div>
  )
}

function PersonvernSection() {
  return (
    <div className={styles.content}>
      <div className={styles.section}>
        <p className={styles.metaText}>Sist oppdatert: april 2026</p>
        <p className={styles.bodyText}>
          Urometoden AS («vi», «oss») er behandlingsansvarlig for personopplysninger som samles inn via urometoden.no. Vi behandler personopplysningene dine i samsvar med personopplysningsloven og EUs personvernforordning (GDPR).
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Hva vi samler inn</h2>
        <ul className={styles.list}>
          <li><strong>Navn og e-postadresse</strong> — hentet fra din Google-konto ved innlogging.</li>
          <li><strong>Sesjonsdata</strong> — en kryptert informasjonskapsel som identifiserer din aktive sesjon. Strengt nødvendig for at tjenesten skal fungere.</li>
          <li><strong>Kursfremgang</strong> — hvilke uker og innholdsenheter du har fullført, lagres lokalt i nettleseren din.</li>
          <li><strong>Refleksjonstekst</strong> — tekst du selv skriver inn i refleksjonsoppgaver. Lagres lokalt i nettleseren din og sendes ikke til våre servere.</li>
          <li><strong>Kontoopplysninger</strong> — abonnementstype og utløpsdato for å administrere din tilgang.</li>
        </ul>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Formål og rettslig grunnlag</h2>
        <p className={styles.bodyText}>
          Vi behandler opplysningene for å levere tjenesten, administrere abonnement og sikre at du får tilgang til riktig innhold. Rettslig grunnlag er oppfyllelse av avtale (GDPR art. 6 nr. 1 b).
        </p>
        <p className={styles.bodyText}>
          Merk: Refleksjonstekst kan inneholde opplysninger om helse og psykisk velvære, som er særlige kategorier etter GDPR art. 9. Disse lagres utelukkende lokalt i din nettleser og behandles ikke av oss.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Lagringstid</h2>
        <p className={styles.bodyText}>
          Kontoopplysninger beholdes så lenge du har en aktiv konto. Ved sletting av konto slettes all tilknyttet data fra våre systemer.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Databehandlere</h2>
        <ul className={styles.list}>
          <li><strong>Google LLC</strong> — brukes for innlogging via OAuth 2.0. Google behandler navn og e-post i forbindelse med autentisering.</li>
          <li><strong>Cloudflare, Inc.</strong> — drifter infrastrukturen tjenesten kjører på, inkludert databasen (D1). Data kan lagres utenfor EØS. Se Cloudflares personvernerklæring for detaljer.</li>
        </ul>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Dine rettigheter</h2>
        <p className={styles.bodyText}>Du har rett til å:</p>
        <ul className={styles.list}>
          <li>Få innsyn i hvilke opplysninger vi har om deg (art. 15)</li>
          <li>Få uriktige opplysninger rettet (art. 16)</li>
          <li>Få opplysninger slettet («retten til å bli glemt», art. 17)</li>
          <li>Motta opplysningene dine i et maskinlesbart format (art. 20)</li>
          <li>Klage til Datatilsynet (datatilsynet.no) dersom du mener vi behandler opplysningene dine ulovlig</li>
        </ul>
        <p className={styles.bodyText}>
          Kontakt oss på <a className={styles.inlineLink} href="mailto:personvern@urometoden.no">personvern@urometoden.no</a> for å utøve dine rettigheter.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Informasjonskapsler</h2>
        <p className={styles.bodyText}>
          Vi bruker én informasjonskapsel: en kryptert sesjonskapsel (<code>session</code>) som er strengt nødvendig for innlogging. Den inneholder ingen sporings- eller reklameinformasjon og krever ikke samtykke etter ekomloven.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Kontakt</h2>
        <p className={styles.bodyText}>
          Spørsmål om personvern kan rettes til <a className={styles.inlineLink} href="mailto:personvern@urometoden.no">personvern@urometoden.no</a>.
        </p>
      </div>
    </div>
  )
}

export default function HelpPage({ section = 'hjelp' }) {
  const tabMap = { 'hjelp': 'Hjelp og støtte', 'personvern': 'Personvern' }
  const [activeTab, setActiveTab] = useState(tabMap[section] ?? 'Hjelp og støtte')

  useEffect(() => {
    setActiveTab(tabMap[section] ?? 'Hjelp og støtte')
  }, [section])

  return (
    <div className={styles.page}>
      <div className={styles.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <main className={styles.main}>
        {activeTab === 'Hjelp og støtte' && <HjelpSection />}
        {activeTab === 'Personvern'       && <PersonvernSection />}
      </main>
    </div>
  )
}
