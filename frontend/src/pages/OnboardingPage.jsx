import { useState, useEffect } from 'react'
import styles from './OnboardingPage.module.css'
import UroLogo from '../components/UroLogo'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  )
}

export default function OnboardingPage() {
  const [tab,             setTab]             = useState('google')
  const [emailMode,       setEmailMode]       = useState('signin')
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newPassword,     setNewPassword]     = useState('')
  const [confirmNew,      setConfirmNew]      = useState('')
  const [error,           setError]           = useState(null)
  const [success,         setSuccess]         = useState(null)
  const [loading,         setLoading]         = useState(false)

  const resetToken = new URLSearchParams(window.location.search).get('reset_token')

  useEffect(() => {
    if (resetToken) {
      setTab('email')
      setEmailMode('reset-confirm')
    }
  }, [])

  function resetForm() {
    setError(null)
    setSuccess(null)
  }

  async function handleSignIn(e) {
    e.preventDefault()
    resetForm()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signin-email', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body:        JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Innlogging feilet'); return }
      window.location.href = '/'
    } catch {
      setError('Noe gikk galt. Prøv igjen.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignUp(e) {
    e.preventDefault()
    resetForm()
    if (password !== confirmPassword) { setError('Passordene stemmer ikke overens'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method:      'POST',
        headers:     { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body:        JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Registrering feilet'); return }
      window.location.href = '/'
    } catch {
      setError('Noe gikk galt. Prøv igjen.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResetRequest(e) {
    e.preventDefault()
    resetForm()
    setLoading(true)
    try {
      await fetch('/api/auth/reset-request', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      })
      setSuccess('Hvis e-posten er registrert, har du nå fått en tilbakestillingslenke.')
    } catch {
      setError('Noe gikk galt. Prøv igjen.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResetConfirm(e) {
    e.preventDefault()
    resetForm()
    if (newPassword !== confirmNew) { setError('Passordene stemmer ikke overens'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-confirm', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token: resetToken, password: newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Tilbakestilling feilet'); return }
      setSuccess('Passordet er oppdatert. Du kan nå logge inn.')
      setEmailMode('signin')
      window.history.replaceState(null, '', '/')
    } catch {
      setError('Noe gikk galt. Prøv igjen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <UroLogo className={styles.logo} />
        <h1 className={styles.heading}>Lev bedre med uro</h1>
        <p className={styles.sub}>
          Et 8-ukers program som hjelper deg å endre forholdet til uro — ikke bekjempe den.
        </p>

        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${tab === 'google' ? styles.tabBtnActive : ''}`}
            onClick={() => { setTab('google'); resetForm() }}
          >
            Google
          </button>
          <button
            className={`${styles.tabBtn} ${tab === 'email' ? styles.tabBtnActive : ''}`}
            onClick={() => { setTab('email'); resetForm() }}
          >
            E-post
          </button>
        </div>

        {tab === 'google' && (
          <>
            <a href="/api/auth/google" className={styles.googleBtn}>
              <GoogleIcon />
              Fortsett med Google
            </a>
            <p className={styles.terms}>
              Ved å fortsette godtar du våre vilkår og personvernregler.
            </p>
          </>
        )}

        {tab === 'email' && emailMode === 'signin' && (
          <form className={styles.form} onSubmit={handleSignIn}>
            <input
              className={styles.input}
              type="email"
              placeholder="E-post"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <input
              className={styles.input}
              type="password"
              placeholder="Passord"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {error   && <p className={styles.formError}>{error}</p>}
            {success && <p className={styles.formSuccess}>{success}</p>}
            <button className={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? 'Logger inn…' : 'Logg inn'}
            </button>
            <div className={styles.formLinks}>
              <button type="button" className={styles.linkBtn} onClick={() => { setEmailMode('signup'); resetForm() }}>
                Opprett konto
              </button>
              <button type="button" className={styles.linkBtn} onClick={() => { setEmailMode('reset'); resetForm() }}>
                Glemt passord?
              </button>
            </div>
          </form>
        )}

        {tab === 'email' && emailMode === 'signup' && (
          <form className={styles.form} onSubmit={handleSignUp}>
            <input
              className={styles.input}
              type="email"
              placeholder="E-post"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <input
              className={styles.input}
              type="password"
              placeholder="Passord (minst 8 tegn)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <input
              className={styles.input}
              type="password"
              placeholder="Bekreft passord"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            {error   && <p className={styles.formError}>{error}</p>}
            {success && <p className={styles.formSuccess}>{success}</p>}
            <button className={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? 'Oppretter konto…' : 'Opprett konto'}
            </button>
            <div className={styles.formLinks}>
              <button type="button" className={styles.linkBtn} onClick={() => { setEmailMode('signin'); resetForm() }}>
                Har du allerede en konto? Logg inn
              </button>
            </div>
          </form>
        )}

        {tab === 'email' && emailMode === 'reset' && (
          <form className={styles.form} onSubmit={handleResetRequest}>
            <p className={styles.resetHint}>
              Skriv inn e-postadressen din, så sender vi deg en tilbakestillingslenke.
            </p>
            <input
              className={styles.input}
              type="email"
              placeholder="E-post"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            {error   && <p className={styles.formError}>{error}</p>}
            {success && <p className={styles.formSuccess}>{success}</p>}
            <button className={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? 'Sender…' : 'Send tilbakestillingslenke'}
            </button>
            <div className={styles.formLinks}>
              <button type="button" className={styles.linkBtn} onClick={() => { setEmailMode('signin'); resetForm() }}>
                Tilbake til innlogging
              </button>
            </div>
          </form>
        )}

        {tab === 'email' && emailMode === 'reset-confirm' && (
          <form className={styles.form} onSubmit={handleResetConfirm}>
            <p className={styles.resetHint}>Velg et nytt passord.</p>
            <input
              className={styles.input}
              type="password"
              placeholder="Nytt passord (minst 8 tegn)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <input
              className={styles.input}
              type="password"
              placeholder="Bekreft nytt passord"
              value={confirmNew}
              onChange={e => setConfirmNew(e.target.value)}
              required
              autoComplete="new-password"
            />
            {error   && <p className={styles.formError}>{error}</p>}
            {success && <p className={styles.formSuccess}>{success}</p>}
            <button className={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? 'Lagrer…' : 'Sett nytt passord'}
            </button>
          </form>
        )}

        <div className={styles.devBanner}>
          <strong>Under utvikling</strong>
          <br />
          Denne siden er under aktiv utvikling. Design og innhold er ikke endelig.
        </div>
      </div>
    </div>
  )
}
