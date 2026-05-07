import { useState, useEffect } from 'react'
import styles from './SettingsModal.module.css'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(n => n[0].toUpperCase()).join('')
}

function getMembershipLabel(user) {
  const { membership, membership_expires_at: exp } = user ?? {}
  if (membership === 'member') return { text: 'Medlem', type: 'member' }
  if (membership === 'trial' && exp > Date.now()) {
    const days = Math.ceil((exp - Date.now()) / 86_400_000)
    return { text: `Prøveperiode · ${days} dag${days !== 1 ? 'er' : ''} igjen`, type: 'trial' }
  }
  return { text: 'Ikke medlem', type: 'none' }
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={[styles.toggle, checked ? styles.toggleOn : '', disabled ? styles.toggleDisabled : ''].filter(Boolean).join(' ')}
      onClick={() => !disabled && onChange(!checked)}
    />
  )
}

// ─── Profil panel ─────────────────────────────────────────────────────────────

function ProfilPanel({ user, onDeleteAccount }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]           = useState(false)
  const membership                        = getMembershipLabel(user)

  async function handleDelete() {
    setDeleting(true)
    await onDeleteAccount()
  }

  if (confirmDelete) {
    return (
      <div className={styles.panelContent}>
        <div className={styles.deleteConfirm}>
          <div className={styles.deleteWarnIcon}>⚠</div>
          <h3 className={styles.deleteConfirmTitle}>Slett konto?</h3>
          <p className={styles.deleteConfirmText}>
            All din data slettes permanent — fremgang, refleksjoner og kurshistorikk.
            Dette kan ikke angres.
          </p>
          <div className={styles.deleteConfirmActions}>
            <button className={styles.cancelBtn} onClick={() => setConfirmDelete(false)} disabled={deleting}>
              Avbryt
            </button>
            <button className={styles.deleteConfirmBtn} onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Sletter…' : 'Ja, slett kontoen min'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.panelContent}>
      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>{getInitials(user.name)}</div>
        <div className={styles.profileInfo}>
          <div className={styles.profileName}>{user.name || '—'}</div>
          <div className={styles.profileEmail}>{user.email}</div>
          <span className={`${styles.memberBadge} ${styles[`memberBadge_${membership.type}`]}`}>
            {membership.text}
          </span>
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabel}>Navn</div>
        <div className={styles.fieldValue}>{user.name || '—'}</div>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabel}>E-post</div>
        <div className={styles.fieldValue}>{user.email}</div>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabel}>Medlemskap</div>
        <div className={styles.fieldValue}>{membership.text}</div>
      </div>

      <div className={styles.dangerZone}>
        <div className={styles.dangerZoneTitle}>Faresone</div>
        <div className={styles.dangerZoneRow}>
          <div>
            <div className={styles.dangerZoneLabel}>Slett konto</div>
            <div className={styles.dangerZoneDesc}>Fjerner all din data permanent.</div>
          </div>
          <button className={styles.deleteBtn} onClick={() => setConfirmDelete(true)}>
            Slett konto
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Innstillinger panel ──────────────────────────────────────────────────────

const MOCK_SETTINGS = [
  { id: 'email_tips',       label: 'E-postvarsler',        desc: 'Daglige tips på e-post'                      },
  { id: 'weekly_reminders', label: 'Ukentlige påminnelser', desc: 'Påminnelse om å gjennomføre ukens innhold'   },
  { id: 'progress_recap',   label: 'Fremdriftsoppsummering', desc: 'Ukentlig oversikt over din fremgang'        },
]

function InnstillingerPanel({ isDark, onToggleTheme }) {
  return (
    <div className={styles.panelContent}>

      <div className={styles.settingGroup}>
        <div className={styles.settingGroupLabel}>Utseende</div>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <div className={styles.settingLabel}>Mørkt tema</div>
            <div className={styles.settingDesc}>Bytt mellom lyst og mørkt utseende</div>
          </div>
          <Toggle checked={isDark} onChange={onToggleTheme} />
        </div>
      </div>

      <div className={styles.settingGroup}>
        <div className={styles.settingGroupLabel}>Varsler</div>
        {MOCK_SETTINGS.map(s => (
          <div key={s.id} className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <div className={styles.settingLabel}>{s.label}</div>
              <div className={styles.settingDesc}>{s.desc}</div>
            </div>
            <Toggle checked={false} onChange={() => {}} disabled />
          </div>
        ))}
        <div className={styles.comingSoon}>Varslingsinnstillinger kommer snart.</div>
      </div>

    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

const PANELS = [
  { id: 'profil',        label: 'Profil'        },
  { id: 'innstillinger', label: 'Innstillinger'  },
]

export default function SettingsModal({ user, initialPanel = 'profil', isDark, onToggleTheme, onClose, onDeleteAccount }) {
  const [panel, setPanel] = useState(initialPanel)

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className={styles.backdrop} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Kontoinnstillinger">

        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>Konto</div>
          {PANELS.map(p => (
            <button
              key={p.id}
              className={`${styles.sidebarItem} ${panel === p.id ? styles.sidebarItemActive : ''}`}
              onClick={() => setPanel(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className={styles.content}>
          <div className={styles.contentHeader}>
            <h2 className={styles.contentTitle}>
              {panel === 'profil' ? 'Profil' : 'Innstillinger'}
            </h2>
            <button className={styles.closeBtn} onClick={onClose} title="Lukk (Esc)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {panel === 'profil' && (
            <ProfilPanel user={user} onDeleteAccount={onDeleteAccount} />
          )}
          {panel === 'innstillinger' && (
            <InnstillingerPanel isDark={isDark} onToggleTheme={onToggleTheme} />
          )}
        </div>

      </div>
    </div>
  )
}
