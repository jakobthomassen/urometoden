import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Modal, Pressable, ActivityIndicator, Alert,
} from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { router, useFocusEffect } from 'expo-router'
import { useTheme } from '@/components/ui/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/api'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string | undefined): string {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(n => n[0].toUpperCase()).join('')
}

type MembershipLabel = { text: string; type: 'member' | 'trial' | 'none' }

function getMembershipLabel(membership: string | undefined, expiresAt: number | null): MembershipLabel {
  if (membership === 'member') return { text: 'Medlem', type: 'member' }
  if (membership === 'trial' && expiresAt && expiresAt > Date.now()) {
    const days = Math.ceil((expiresAt - Date.now()) / 86_400_000)
    return { text: `Prøveperiode · ${days} dag${days !== 1 ? 'er' : ''} igjen`, type: 'trial' }
  }
  return { text: 'Ikke medlem', type: 'none' }
}

function fmtHours(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  return `${h}t`
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ value, onValueChange, disabled = false, C }: {
  value: boolean; onValueChange: (v: boolean) => void; disabled?: boolean; C: any
}) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current
  useEffect(() => {
    Animated.timing(anim, { toValue: value ? 1 : 0, duration: 200, useNativeDriver: false }).start()
  }, [value])
  const bg   = anim.interpolate({ inputRange: [0, 1], outputRange: [C.border, C.primary] })
  const knob = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 22] })
  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      style={{ opacity: disabled ? 0.4 : 1 }}
      hitSlop={8}
    >
      <Animated.View style={[toggleStyles.track, { backgroundColor: bg }]}>
        <Animated.View style={[toggleStyles.knob, { left: knob }]} />
      </Animated.View>
    </Pressable>
  )
}
const toggleStyles = StyleSheet.create({
  track: { width: 44, height: 26, borderRadius: 13, justifyContent: 'center' },
  knob:  { position: 'absolute', width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
})

// ─── FadeUp ───────────────────────────────────────────────────────────────────

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity    = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(18)).current
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity,    { toValue: 1, duration: 450, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 450, delay, useNativeDriver: true }),
    ]).start()
  }, [])
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>
}

// ─── SettingsModal ────────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS = [
  { id: 'email_tips',       label: 'E-postvarsler',          desc: 'Daglige tips på e-post' },
  { id: 'weekly_reminders', label: 'Ukentlige påminnelser',  desc: 'Påminnelse om å gjennomføre ukens innhold' },
  { id: 'progress_recap',   label: 'Fremdriftsoppsummering', desc: 'Ukentlig oversikt over din fremgang' },
]

function SettingsModal({ onClose, C, isDark, toggleTheme, user, token, signOut }: {
  onClose: () => void; C: any; isDark: boolean; toggleTheme: () => void
  user: any; token: string | null; signOut: () => Promise<void>
}) {
  const [panel, setPanel]             = useState<'profil' | 'innstillinger'>('profil')
  const [confirmDelete, setConfirm]   = useState(false)
  const [deleting, setDeleting]       = useState(false)
  const membership = getMembershipLabel(user?.membership, user?.membership_expires_at)

  const badgeColor = membership.type === 'member' ? '#4A7C5F' : membership.type === 'trial' ? '#B97635' : C.mutedText
  const badgeBg    = membership.type === 'member' ? '#E5EFE8' : membership.type === 'trial' ? '#F7E8D8' : C.border

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      await apiFetch('/api/me/account', { method: 'DELETE' }, token)
      await signOut()
    } catch {
      setDeleting(false)
      Alert.alert('Feil', 'Noe gikk galt. Prøv igjen.')
    }
  }

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[settingsStyles.container, { backgroundColor: C.background }]}>

        {/* Header */}
        <View style={[settingsStyles.header, { borderBottomColor: C.border }]}>
          <Text style={[settingsStyles.headerTitle, { color: C.text }]}>Konto</Text>
          <Pressable onPress={onClose} hitSlop={12} style={settingsStyles.closeBtn}>
            <Ionicons name="close" size={22} color={C.mutedText} />
          </Pressable>
        </View>

        {/* Tab switcher */}
        <View style={[settingsStyles.tabRow, { backgroundColor: C.card, borderBottomColor: C.border }]}>
          {(['profil', 'innstillinger'] as const).map(p => (
            <Pressable
              key={p}
              onPress={() => { setPanel(p); setConfirm(false) }}
              style={[settingsStyles.tab, panel === p && [settingsStyles.tabActive, { borderBottomColor: C.primary }]]}
            >
              <Text style={[settingsStyles.tabText, { color: panel === p ? C.primary : C.mutedText }]}>
                {p === 'profil' ? 'Profil' : 'Innstillinger'}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView contentContainerStyle={settingsStyles.content} showsVerticalScrollIndicator={false}>

          {/* ── Profil panel ── */}
          {panel === 'profil' && (
            confirmDelete ? (
              <View style={settingsStyles.deleteConfirm}>
                <Text style={settingsStyles.deleteWarnIcon}>⚠</Text>
                <Text style={[settingsStyles.deleteConfirmTitle, { color: C.text }]}>Slett konto?</Text>
                <Text style={[settingsStyles.deleteConfirmText, { color: C.mutedText }]}>
                  All din data slettes permanent — fremgang, refleksjoner og kurshistorikk. Dette kan ikke angres.
                </Text>
                <View style={settingsStyles.deleteActions}>
                  <TouchableOpacity
                    style={[settingsStyles.cancelBtn, { borderColor: C.border }]}
                    onPress={() => setConfirm(false)}
                    disabled={deleting}
                    activeOpacity={0.8}
                  >
                    <Text style={[settingsStyles.cancelBtnText, { color: C.text }]}>Avbryt</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={settingsStyles.deleteConfirmBtn}
                    onPress={handleDeleteAccount}
                    disabled={deleting}
                    activeOpacity={0.8}
                  >
                    <Text style={settingsStyles.deleteConfirmBtnText}>
                      {deleting ? 'Sletter…' : 'Ja, slett kontoen min'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {/* Profile card */}
                <View style={[settingsStyles.profileCard, { backgroundColor: C.card, borderColor: C.border }]}>
                  <View style={[settingsStyles.profileAvatar, { backgroundColor: C.background }]}>
                    <Text style={[settingsStyles.profileInitials, { color: C.primary }]}>
                      {getInitials(user?.name)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[settingsStyles.profileName, { color: C.text }]}>{user?.name || '—'}</Text>
                    <Text style={[settingsStyles.profileEmail, { color: C.mutedText }]}>{user?.email}</Text>
                    <View style={[settingsStyles.memberBadge, { backgroundColor: badgeBg }]}>
                      <Text style={[settingsStyles.memberBadgeText, { color: badgeColor }]}>
                        {membership.text}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Fields */}
                {[
                  { label: 'Navn',        value: user?.name  || '—' },
                  { label: 'E-post',      value: user?.email || '—' },
                  { label: 'Medlemskap',  value: membership.text   },
                ].map(f => (
                  <View key={f.label} style={[settingsStyles.fieldRow, { borderBottomColor: C.border }]}>
                    <Text style={[settingsStyles.fieldLabel, { color: C.mutedText }]}>{f.label}</Text>
                    <Text style={[settingsStyles.fieldValue, { color: C.text }]}>{f.value}</Text>
                  </View>
                ))}

                {/* Sign out */}
                <TouchableOpacity
                  style={[settingsStyles.signOutRow, { borderColor: C.border }]}
                  onPress={() => { onClose(); signOut() }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="log-out-outline" size={20} color={C.mutedText} />
                  <Text style={[settingsStyles.signOutText, { color: C.mutedText }]}>Logg ut</Text>
                </TouchableOpacity>

                {/* Danger zone */}
                <View style={[settingsStyles.dangerZone, { borderColor: '#E53E3E33' }]}>
                  <Text style={settingsStyles.dangerZoneTitle}>Faresone</Text>
                  <View style={settingsStyles.dangerRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[settingsStyles.dangerLabel, { color: C.text }]}>Slett konto</Text>
                      <Text style={[settingsStyles.dangerDesc, { color: C.mutedText }]}>
                        Fjerner all din data permanent.
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={settingsStyles.deleteBtn}
                      onPress={() => setConfirm(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={settingsStyles.deleteBtnText}>Slett konto</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )
          )}

          {/* ── Innstillinger panel ── */}
          {panel === 'innstillinger' && (
            <>
              <Text style={[settingsStyles.groupLabel, { color: C.mutedText }]}>UTSEENDE</Text>
              <View style={[settingsStyles.settingCard, { backgroundColor: C.card, borderColor: C.border }]}>
                <View style={settingsStyles.settingRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[settingsStyles.settingLabel, { color: C.text }]}>Mørkt tema</Text>
                    <Text style={[settingsStyles.settingDesc, { color: C.mutedText }]}>
                      Bytt mellom lyst og mørkt utseende
                    </Text>
                  </View>
                  <Toggle value={isDark} onValueChange={toggleTheme} C={C} />
                </View>
              </View>

              <Text style={[settingsStyles.groupLabel, { color: C.mutedText, marginTop: 24 }]}>VARSLER</Text>
              <View style={[settingsStyles.settingCard, { backgroundColor: C.card, borderColor: C.border }]}>
                {MOCK_NOTIFICATIONS.map((s, i) => (
                  <View
                    key={s.id}
                    style={[
                      settingsStyles.settingRow,
                      i < MOCK_NOTIFICATIONS.length - 1 && [settingsStyles.settingRowDivider, { borderBottomColor: C.border }],
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[settingsStyles.settingLabel, { color: C.text }]}>{s.label}</Text>
                      <Text style={[settingsStyles.settingDesc, { color: C.mutedText }]}>{s.desc}</Text>
                    </View>
                    <Toggle value={false} onValueChange={() => {}} disabled C={C} />
                  </View>
                ))}
              </View>
              <Text style={[settingsStyles.comingSoon, { color: C.mutedText }]}>
                Varslingsinnstillinger kommer snart.
              </Text>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  )
}

const settingsStyles = StyleSheet.create({
  container:            { flex: 1 },
  header:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle:          { fontSize: 18, fontWeight: '700' },
  closeBtn:             { padding: 4 },
  tabRow:               { flexDirection: 'row', borderBottomWidth: 1 },
  tab:                  { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:            {},
  tabText:              { fontSize: 15, fontWeight: '600' },
  content:              { padding: 20, paddingBottom: 60 },
  profileCard:          { flexDirection: 'row', gap: 16, alignItems: 'center', borderRadius: 20, borderWidth: 1, padding: 18, marginBottom: 24 },
  profileAvatar:        { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  profileInitials:      { fontSize: 22, fontWeight: '700' },
  profileName:          { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  profileEmail:         { fontSize: 14, marginBottom: 8 },
  memberBadge:          { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  memberBadgeText:      { fontSize: 12, fontWeight: '700' },
  fieldRow:             { paddingVertical: 14, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fieldLabel:           { fontSize: 14 },
  fieldValue:           { fontSize: 15, fontWeight: '500' },
  signOutRow:           { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 24, marginBottom: 8, padding: 14, borderRadius: 14, borderWidth: 1 },
  signOutText:          { fontSize: 15, fontWeight: '600' },
  dangerZone:           { marginTop: 24, borderRadius: 14, borderWidth: 1, padding: 16 },
  dangerZoneTitle:      { fontSize: 12, fontWeight: '700', letterSpacing: 1, color: '#E53E3E', marginBottom: 14 },
  dangerRow:            { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dangerLabel:          { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  dangerDesc:           { fontSize: 13 },
  deleteBtn:            { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: '#FEE2E2' },
  deleteBtnText:        { fontSize: 13, fontWeight: '700', color: '#E53E3E' },
  deleteConfirm:        { alignItems: 'center', paddingTop: 20 },
  deleteWarnIcon:       { fontSize: 40, marginBottom: 16 },
  deleteConfirmTitle:   { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  deleteConfirmText:    { fontSize: 15, lineHeight: 24, textAlign: 'center', marginBottom: 28 },
  deleteActions:        { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn:            { flex: 1, height: 50, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText:        { fontSize: 15, fontWeight: '600' },
  deleteConfirmBtn:     { flex: 1, height: 50, borderRadius: 14, backgroundColor: '#E53E3E', alignItems: 'center', justifyContent: 'center' },
  deleteConfirmBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  groupLabel:           { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  settingCard:          { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  settingRow:           { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  settingRowDivider:    { borderBottomWidth: 1 },
  settingLabel:         { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  settingDesc:          { fontSize: 13 },
  comingSoon:           { fontSize: 13, marginTop: 10, textAlign: 'center' },
})

// ─── ProfilScreen ─────────────────────────────────────────────────────────────

type Stats = { streak: number; total_listen_seconds: number; weeks_completed: number }

export default function ProfilScreen() {
  const { isDark, toggleTheme, colors: C } = useTheme()
  const { user, token, signOut }            = useAuth()
  const [activeTab, setActiveTab]           = useState<'progress' | 'reflections'>('progress')
  const [stats, setStats]                   = useState<Stats | null>(null)
  const [showSettings, setShowSettings]     = useState(false)

  const palette = useMemo(() => ({
    avatarBg:           isDark ? '#2A2926' : '#E8E6DF',
    segmentBg:          isDark ? '#262420' : '#E4E0D8',
    activeSegmentBg:    isDark ? '#1D1C1A' : C.background,
    activeSegmentBorder: isDark ? '#4D6E5C' : '#B8CBC0',
    progressTrack:      isDark ? '#312F2B' : '#E8E3DA',
  }), [C, isDark])

  useFocusEffect(useCallback(() => {
    apiFetch('/api/me/stats', {}, token)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setStats(data) })
      .catch(() => {})
  }, [token]))

  const weeksCompleted = stats?.weeks_completed ?? 0

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: C.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <FadeUp delay={0}>
          <View style={styles.headerRow}>
            <View style={styles.profileLeft}>
              <View style={[styles.avatar, { backgroundColor: palette.avatarBg }]}>
                <Text style={[styles.avatarText, { color: C.primary }]}>
                  {getInitials(user?.name)}
                </Text>
              </View>
              <View>
                <Text style={[styles.name, { color: C.text }]}>{user?.name || '—'}</Text>
                <Text style={[styles.email, { color: C.mutedText }]}>{user?.email}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={() => setShowSettings(true)}>
              <Ionicons name="settings-outline" size={24} color={C.mutedText} />
            </TouchableOpacity>
          </View>
        </FadeUp>

        <FadeUp delay={100}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <View style={styles.statTopRow}>
                <Ionicons name="flame-outline" size={22} color={C.primary} />
                <Text style={[styles.statNumber, { color: C.text }]}>{stats?.streak ?? 0}</Text>
              </View>
              <Text style={[styles.statLabel, { color: C.mutedText }]}>Dager på rad</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.statNumber, { color: C.text }]}>
                {stats ? fmtHours(stats.total_listen_seconds) : '0t'}
              </Text>
              <Text style={[styles.statLabel, { color: C.mutedText }]}>Timer lyttet</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Text style={[styles.statNumber, { color: C.text }]}>{weeksCompleted}/8</Text>
              <Text style={[styles.statLabel, { color: C.mutedText }]}>Uker</Text>
            </View>
          </View>
        </FadeUp>

        <FadeUp delay={180}>
          <View style={[styles.segmentWrap, { backgroundColor: palette.segmentBg }]}>
            {(['progress', 'reflections'] as const).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.segmentButton,
                  activeTab === tab && {
                    backgroundColor: palette.activeSegmentBg,
                    borderWidth: 1,
                    borderColor: palette.activeSegmentBorder,
                  },
                ]}
                activeOpacity={0.85}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.segmentText, { color: activeTab === tab ? C.text : C.mutedText }]}>
                  {tab === 'progress' ? 'Fremgang' : 'Refleksjoner'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </FadeUp>

        {activeTab === 'progress' ? (
          <>
            <FadeUp delay={260}>
              <TouchableOpacity
                style={[styles.progressCard, { backgroundColor: C.card, borderColor: C.border }]}
                activeOpacity={0.9}
                onPress={() => router.push('/(tabs)/reise')}
              >
                <View style={styles.progressHeader}>
                  <View>
                    <Text style={[styles.progressTitle, { color: C.text }]}>Uropraksis</Text>
                    <Text style={[styles.progressSubtitle, { color: C.mutedText }]}>8-ukersreise</Text>
                  </View>
                  <Text style={[styles.progressLink, { color: C.primary }]}>
                    {weeksCompleted > 0 ? 'Fortsett ›' : 'Start ›'}
                  </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: palette.progressTrack }]}>
                  <View style={[styles.progressFill, { width: `${(weeksCompleted / 8) * 100}%`, backgroundColor: C.primary }]} />
                </View>
                <Text style={[styles.progressText, { color: C.mutedText }]}>
                  {weeksCompleted} av 8 uker fullført
                </Text>
              </TouchableOpacity>
            </FadeUp>

            <FadeUp delay={340}>
              <TouchableOpacity
                style={[styles.linkCard, { backgroundColor: C.card, borderColor: C.border }]}
                activeOpacity={0.9}
                onPress={() => router.push('/(tabs)/lydbibliotek')}
              >
                <View style={styles.linkLeft}>
                  <View style={[styles.linkIconBox, { backgroundColor: C.background }]}>
                    <Ionicons name="headset-outline" size={26} color={C.text} />
                  </View>
                  <View>
                    <Text style={[styles.linkTitle, { color: C.text }]}>Lydbibliotek</Text>
                    <Text style={[styles.linkSubtitle, { color: C.mutedText }]}>Utforsk alle lydøkter</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={26} color={C.mutedText} />
              </TouchableOpacity>
            </FadeUp>

            <FadeUp delay={420}>
              <TouchableOpacity
                style={[styles.linkCard, { backgroundColor: C.card, borderColor: C.border }]}
                activeOpacity={0.9}
                onPress={() => router.push('/(tabs)/kurs')}
              >
                <View style={styles.linkLeft}>
                  <View style={[styles.linkIconBox, { backgroundColor: C.background }]}>
                    <Ionicons name="school-outline" size={26} color={C.text} />
                  </View>
                  <View>
                    <Text style={[styles.linkTitle, { color: C.text }]}>Uro-skolen</Text>
                    <Text style={[styles.linkSubtitle, { color: C.mutedText }]}>Kunnskap og historier</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={26} color={C.mutedText} />
              </TouchableOpacity>
            </FadeUp>
          </>
        ) : (
          <FadeUp delay={260}>
            <TouchableOpacity
              style={[styles.linkCard, { backgroundColor: C.card, borderColor: C.border }]}
              activeOpacity={0.9}
              onPress={() => router.push('/reflections')}
            >
              <View style={styles.linkLeft}>
                <View style={[styles.linkIconBox, { backgroundColor: C.background }]}>
                  <Ionicons name="create-outline" size={26} color={C.text} />
                </View>
                <View>
                  <Text style={[styles.linkTitle, { color: C.text }]}>Refleksjoner</Text>
                  <Text style={[styles.linkSubtitle, { color: C.mutedText }]}>Skriv ned det du legger merke til</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={26} color={C.mutedText} />
            </TouchableOpacity>
          </FadeUp>
        )}
      </ScrollView>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          C={C}
          isDark={isDark}
          toggleTheme={toggleTheme}
          user={user}
          token={token}
          signOut={signOut}
        />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container:       { flex: 1 },
  content:         { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 120 },
  headerRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 },
  profileLeft:     { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  avatar:          { width: 88, height: 88, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText:      { fontSize: 28, fontWeight: '700' },
  name:            { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  email:           { fontSize: 15 },
  iconButton:      { padding: 8 },
  statsRow:        { flexDirection: 'row', gap: 14, marginBottom: 22 },
  statCard:        { flex: 1, minHeight: 132, borderRadius: 26, borderWidth: 1, padding: 18, alignItems: 'center', justifyContent: 'center' },
  statTopRow:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  statNumber:      { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  statLabel:       { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  segmentWrap:     { flexDirection: 'row', borderRadius: 24, padding: 6, marginBottom: 22 },
  segmentButton:   { flex: 1, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  segmentText:     { fontSize: 16, fontWeight: '600' },
  progressCard:    { borderRadius: 28, borderWidth: 1, padding: 20, marginBottom: 18 },
  progressHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  progressTitle:   { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  progressSubtitle:{ fontSize: 15 },
  progressLink:    { fontSize: 16, fontWeight: '600' },
  progressBar:     { height: 14, borderRadius: 999, overflow: 'hidden', marginBottom: 14 },
  progressFill:    { height: '100%', borderRadius: 999 },
  progressText:    { fontSize: 15, fontWeight: '600' },
  linkCard:        { borderRadius: 28, borderWidth: 1, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  linkLeft:        { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  linkIconBox:     { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  linkTitle:       { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  linkSubtitle:    { fontSize: 15 },
})
