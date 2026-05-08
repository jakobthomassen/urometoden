import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Animated, ActivityIndicator, Linking, Modal, Pressable,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useFocusEffect } from 'expo-router'
import { useTheme } from '@/components/ui/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/api'

type Event = {
  id: number
  title: string
  event_date: number
  type: 'online' | 'fysisk'
  location: string | null
  link: string | null
  description: string | null
  reveal_at: number | null
  reveal_pending?: boolean
  cancelled: number
}

type SectionCard = {
  id: number
  section: 'fordypning' | 'uroskolen'
  icon: string
  title: string
  description: string | null
  link: string | null
  link_label: string | null
  sort_order: number
}

const MONTHS = ['jan','feb','mar','apr','mai','jun','jul','aug','sep','okt','nov','des']

function formatDate(ms: number): string {
  const d = new Date(ms)
  const hours = String(d.getHours()).padStart(2, '0')
  const mins  = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()} · ${hours}:${mins}`
}

const ICON_MAP: Record<string, string> = {
  'user':          'person-outline',
  'calendar-days': 'calendar-outline',
  'info':          'information-circle-outline',
  'layers':        'layers-outline',
  'headset':       'headset-outline',
  'book':          'book-outline',
  'sunny':         'sunny-outline',
  'music':         'musical-notes-outline',
}
const getIcon = (name: string) => ICON_MAP[name] ?? 'ellipse-outline'

function ArchiveModal({ onClose, token, C }: { onClose: () => void; token: string | null; C: any }) {
  const [archiveEvents, setArchive] = useState<Event[]>([])
  const [page, setPage]             = useState(1)
  const [hasMore, setHasMore]       = useState(false)
  const [loading, setLoading]       = useState(false)
  const [detail, setDetail]         = useState<Event | null>(null)

  async function fetchPage(p: number) {
    setLoading(true)
    try {
      const r    = await apiFetch(`/api/events?archive=1&page=${p}&per_page=10`, {}, token)
      const data = await r.json()
      setArchive(prev => p === 1 ? data.events : [...prev, ...data.events])
      setHasMore(data.hasMore)
      setPage(p)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchPage(1) }, [])

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[archStyles.container, { backgroundColor: C.background }]}>
        <View style={[archStyles.header, { borderBottomColor: C.border }]}>
          {detail ? (
            <Pressable onPress={() => setDetail(null)} style={archStyles.backBtn} hitSlop={12}>
              <Ionicons name="chevron-back" size={22} color={C.text} />
              <Text style={[archStyles.backText, { color: C.text }]}>Tilbake</Text>
            </Pressable>
          ) : (
            <Text style={[archStyles.headerTitle, { color: C.text }]}>Tidligere hendelser</Text>
          )}
          <Pressable onPress={onClose} style={archStyles.closeBtn} hitSlop={12}>
            <Ionicons name="close" size={22} color={C.mutedText} />
          </Pressable>
        </View>

        {detail ? (
          <ScrollView contentContainerStyle={archStyles.detailContent}>
            <View style={styles.badgeRow}>
              {detail.cancelled ? (
                <View style={[styles.badge, { backgroundColor: '#F5E0E0' }]}>
                  <Text style={[styles.badgeText, { color: '#C0392B' }]}>Avlyst</Text>
                </View>
              ) : (
                <View style={[styles.badge, { backgroundColor: detail.type === 'online' ? '#E5EFE8' : '#F7E8D8' }]}>
                  <Text style={[styles.badgeText, { color: detail.type === 'online' ? C.primary : '#B97635' }]}>
                    {detail.type === 'online' ? 'Online' : 'Fysisk'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[archStyles.detailTitle, { color: C.text }]}>{detail.title}</Text>
            <Text style={[archStyles.detailMeta, { color: C.mutedText }]}>{formatDate(detail.event_date)}</Text>
            {detail.location ? (
              <Text style={[archStyles.detailMeta, { color: C.mutedText }]}>📍 {detail.location}</Text>
            ) : null}
            {detail.description ? (
              <Text style={[archStyles.detailDesc, { color: C.mutedText }]}>{detail.description}</Text>
            ) : null}
            {detail.link ? (
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: C.background, borderColor: C.border, marginTop: 8 }]}
                onPress={() => Linking.openURL(detail.link!)}
              >
                <Text style={[styles.modalButtonText, { color: C.text }]}>Gå til arrangement →</Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={archStyles.listContent}>
            {archiveEvents.length === 0 && !loading && (
              <Text style={[archStyles.empty, { color: C.mutedText }]}>Ingen tidligere hendelser.</Text>
            )}
            {archiveEvents.map(ev => (
              <TouchableOpacity
                key={ev.id}
                onPress={() => setDetail(ev)}
                style={[archStyles.row, { borderBottomColor: C.border }]}
                activeOpacity={0.8}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[archStyles.rowTitle, { color: C.text }]}>{ev.title}</Text>
                  <Text style={[archStyles.rowDate, { color: C.mutedText }]}>{formatDate(ev.event_date)}</Text>
                </View>
                <View style={[styles.badge, {
                  backgroundColor: ev.cancelled ? '#F5E0E0' : ev.type === 'online' ? '#E5EFE8' : '#F7E8D8',
                }]}>
                  <Text style={[styles.badgeText, {
                    color: ev.cancelled ? '#C0392B' : ev.type === 'online' ? C.primary : '#B97635',
                  }]}>
                    {ev.cancelled ? 'Avlyst' : ev.type === 'online' ? 'Online' : 'Fysisk'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            {loading && <ActivityIndicator color={C.primary} style={{ marginTop: 24 }} />}
            {hasMore && !loading && (
              <TouchableOpacity
                onPress={() => fetchPage(page + 1)}
                style={[archStyles.loadMore, { borderColor: C.border }]}
                activeOpacity={0.8}
              >
                <Text style={[archStyles.loadMoreText, { color: C.text }]}>Vis mer</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  )
}

const archStyles = StyleSheet.create({
  container:     { flex: 1 },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle:   { fontSize: 18, fontWeight: '700' },
  backBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText:      { fontSize: 16, fontWeight: '600' },
  closeBtn:      { padding: 4 },
  listContent:   { paddingBottom: 40 },
  row:           { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  rowTitle:      { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  rowDate:       { fontSize: 13 },
  empty:         { textAlign: 'center', marginTop: 40, fontSize: 15 },
  loadMore:      { margin: 20, borderRadius: 14, borderWidth: 1, height: 48, alignItems: 'center', justifyContent: 'center' },
  loadMoreText:  { fontSize: 15, fontWeight: '600' },
  detailContent: { padding: 20, paddingBottom: 60 },
  detailTitle:   { fontSize: 22, fontWeight: '700', lineHeight: 30, marginBottom: 12 },
  detailMeta:    { fontSize: 15, marginBottom: 10 },
  detailDesc:    { fontSize: 16, lineHeight: 26, marginTop: 8 },
})

function FadeUpSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
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

export default function KursScreen() {
  const { colors: C } = useTheme()
  const { token }      = useAuth()

  const [events, setEvents]           = useState<Event[]>([])
  const [cards, setCards]             = useState<SectionCard[]>([])
  const [loadingEvents, setLoading]   = useState(true)
  const [selectedEvent, setSelected]  = useState<Event | null>(null)
  const [selectedCard, setSelectedCard] = useState<SectionCard | null>(null)
  const [showArchive, setShowArchive] = useState(false)

  useFocusEffect(useCallback(() => {
    setLoading(true)
    Promise.all([
      apiFetch('/api/events', {}, token).then(r => r.ok ? r.json() : []),
      apiFetch('/api/section-cards', {}, token).then(r => r.ok ? r.json() : []),
    ]).then(([evts, scs]) => {
      setEvents(evts)
      setCards(scs)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [token]))

  const fordypning = cards.filter(c => c.section === 'fordypning')
  const uroskolen  = cards.filter(c => c.section === 'uroskolen')

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: C.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <FadeUpSection>
          <Text style={[styles.title, { color: C.text }]}>Kurs</Text>
          <Text style={[styles.subtitle, { color: C.mutedText }]}>
            Veiledning, fordypning og Uro-skolen.
          </Text>
        </FadeUpSection>

        <FadeUpSection delay={100}>
          <Text style={[styles.sectionLabel, { color: C.mutedText }]}>KURS</Text>

          {loadingEvents ? (
            <ActivityIndicator color={C.primary} style={{ marginBottom: 20 }} />
          ) : events.length === 0 ? (
            <Text style={[styles.emptyText, { color: C.mutedText }]}>
              Ingen kommende arrangementer.
            </Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.courseRow}
            >
              {events.map(ev => {
                const typeBg    = ev.type === 'online' ? '#E5EFE8' : '#F7E8D8'
                const typeColor = ev.type === 'online' ? C.primary : '#B97635'
                const typeLabel = ev.type === 'online' ? 'Online' : 'Fysisk'
                return (
                  <TouchableOpacity
                    key={ev.id}
                    activeOpacity={0.9}
                    onPress={() => setSelected(ev)}
                    style={[styles.courseCard, { backgroundColor: C.card, borderColor: C.border }]}
                  >
                    <View style={styles.badgeRow}>
                      <View style={[styles.badge, { backgroundColor: typeBg }]}>
                        <Text style={[styles.badgeText, { color: typeColor }]}>{typeLabel}</Text>
                      </View>
                      {!!ev.cancelled && (
                        <View style={[styles.badge, { backgroundColor: '#F5E0E0' }]}>
                          <Text style={[styles.badgeText, { color: '#C0392B' }]}>Avlyst</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.courseTitle, { color: ev.cancelled ? C.mutedText : C.text }]}>
                      {ev.title}
                    </Text>
                    <Text style={[styles.courseMeta, { color: C.mutedText }]}>
                      {formatDate(ev.event_date)}
                    </Text>
                    {ev.reveal_pending ? (
                      <Text style={[styles.courseMeta, { color: C.mutedText, fontStyle: 'italic' }]}>
                        Detaljer kommer snart
                      </Text>
                    ) : ev.location ? (
                      <Text style={[styles.courseMeta, { color: C.mutedText }]}>{ev.location}</Text>
                    ) : null}
                    {ev.description ? (
                      <Text style={[styles.courseText, { color: C.mutedText }]} numberOfLines={3}>
                        {ev.description}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          )}

          <TouchableOpacity onPress={() => setShowArchive(true)} style={styles.archiveLinkWrap}>
            <Text style={[styles.archiveLink, { color: C.mutedText }]}>Vis tidligere hendelser</Text>
          </TouchableOpacity>
        </FadeUpSection>

        <View style={[styles.divider, { backgroundColor: C.border }]} />

        {fordypning.length > 0 && (
          <FadeUpSection delay={180}>
            <Text style={[styles.sectionLabel, { color: C.mutedText }]}>UROFORDYPNING</Text>
            <View style={styles.bigGrid}>
              {fordypning.map(card => (
                <TouchableOpacity
                  key={card.id}
                  activeOpacity={0.9}
                  onPress={() => setSelectedCard(card)}
                  style={[styles.bigCard, { backgroundColor: C.card, borderColor: C.border }]}
                >
                  <View style={[styles.iconBox, { backgroundColor: C.background }]}>
                    <Ionicons name={getIcon(card.icon) as any} size={24} color={C.text} />
                  </View>
                  <Text style={[styles.bigCardTitle, { color: C.text }]}>{card.title}</Text>
                  {card.description ? (
                    <Text style={[styles.bigCardText, { color: C.mutedText }]}>{card.description}</Text>
                  ) : null}
                  {card.link_label ? (
                    <Text style={[styles.bigCardAction, { color: C.primary }]}>{card.link_label} →</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          </FadeUpSection>
        )}

        {uroskolen.length > 0 && (
          <>
            <View style={[styles.divider, { backgroundColor: C.border }]} />
            <FadeUpSection delay={260}>
              <Text style={[styles.sectionLabel, { color: C.mutedText }]}>URO-SKOLEN</Text>
              <View style={styles.bigGrid}>
                {uroskolen.map(card => (
                  <TouchableOpacity
                    key={card.id}
                    activeOpacity={card.link ? 0.9 : 1}
                    onPress={() => card.link && Linking.openURL(card.link)}
                    style={[styles.bigCard, { backgroundColor: C.card, borderColor: C.border }]}
                  >
                    <View style={[styles.iconBox, { backgroundColor: C.background }]}>
                      <Ionicons name={getIcon(card.icon) as any} size={24} color={C.text} />
                    </View>
                    <Text style={[styles.bigCardTitle, { color: C.text }]}>{card.title}</Text>
                    {card.description ? (
                      <Text style={[styles.bigCardText, { color: C.mutedText }]}>{card.description}</Text>
                    ) : null}
                    {card.link_label ? (
                      <Text style={[styles.bigCardAction, { color: C.primary }]}>{card.link_label} →</Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            </FadeUpSection>
          </>
        )}
      </ScrollView>

      <Modal visible={!!selectedCard} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: C.card }]}>
            <TouchableOpacity
              style={[styles.closeButton, { borderColor: C.border }]}
              onPress={() => setSelectedCard(null)}
            >
              <Ionicons name="close" size={22} color={C.mutedText} />
            </TouchableOpacity>

            {selectedCard && (
              <>
                <View style={cardModalStyles.titleRow}>
                  <View style={[styles.iconBox, { backgroundColor: C.background, marginBottom: 0 }]}>
                    <Ionicons name={getIcon(selectedCard.icon) as any} size={24} color={C.text} />
                  </View>
                  <Text style={[cardModalStyles.title, { color: C.text }]}>{selectedCard.title}</Text>
                </View>

                {selectedCard.description ? (
                  <Text style={[cardModalStyles.description, { color: C.mutedText }]}>
                    {selectedCard.description}
                  </Text>
                ) : null}

                {selectedCard.link ? (
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: C.background, borderColor: C.border, marginTop: 8 }]}
                    onPress={() => { setSelectedCard(null); Linking.openURL(selectedCard.link!) }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.modalButtonText, { color: C.text }]}>
                      {selectedCard.link_label || 'Les mer'} →
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={!!selectedEvent} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: C.card }]}>
            <TouchableOpacity
              style={[styles.closeButton, { borderColor: C.border }]}
              onPress={() => setSelected(null)}
            >
              <Ionicons name="close" size={22} color={C.mutedText} />
            </TouchableOpacity>

            {selectedEvent && (() => {
              const typeBg    = selectedEvent.type === 'online' ? '#E5EFE8' : '#F7E8D8'
              const typeColor = selectedEvent.type === 'online' ? C.primary : '#B97635'
              const typeLabel = selectedEvent.type === 'online' ? 'Online' : 'Fysisk'
              return (
                <>
                  <View style={styles.badgeRow}>
                    <View style={[styles.badge, { backgroundColor: typeBg }]}>
                      <Text style={[styles.badgeText, { color: typeColor }]}>{typeLabel}</Text>
                    </View>
                    {!!selectedEvent.cancelled && (
                      <View style={[styles.badge, { backgroundColor: '#F5E0E0' }]}>
                        <Text style={[styles.badgeText, { color: '#C0392B' }]}>Avlyst</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.modalTitle, { color: C.text }]}>{selectedEvent.title}</Text>
                  <Text style={[styles.modalText, { color: C.mutedText }]}>
                    {formatDate(selectedEvent.event_date)}
                  </Text>
                  {selectedEvent.reveal_pending ? (
                    <Text style={[styles.modalText, { color: C.mutedText, fontStyle: 'italic' }]}>
                      Detaljer kommer snart
                    </Text>
                  ) : selectedEvent.location ? (
                    <Text style={[styles.modalText, { color: C.mutedText }]}>
                      📍 {selectedEvent.location}
                    </Text>
                  ) : null}
                  {selectedEvent.description ? (
                    <Text style={[styles.modalDescription, { color: C.mutedText }]}>
                      {selectedEvent.description}
                    </Text>
                  ) : null}
                  {!selectedEvent.cancelled && !selectedEvent.reveal_pending && selectedEvent.link ? (
                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: C.background, borderColor: C.border }]}
                      onPress={() => { setSelected(null); Linking.openURL(selectedEvent.link!) }}
                    >
                      <Text style={[styles.modalButtonText, { color: C.text }]}>
                        Gå til arrangement →
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              )
            })()}
          </View>
        </View>
      </Modal>

      {showArchive && (
        <ArchiveModal onClose={() => setShowArchive(false)} token={token} C={C} />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  content:          { paddingTop: 72, paddingBottom: 120 },
  title:            { fontSize: 40, fontWeight: '700', paddingHorizontal: 24, marginBottom: 6 },
  subtitle:         { fontSize: 17, paddingHorizontal: 24, marginBottom: 34 },
  sectionLabel:     { fontSize: 13, fontWeight: '700', letterSpacing: 1.2, paddingHorizontal: 24, marginBottom: 14 },
  emptyText:        { fontSize: 15, paddingHorizontal: 24, marginBottom: 20 },
  courseRow:        { paddingHorizontal: 24, gap: 14, marginBottom: 16 },
  courseCard:       { width: 230, minHeight: 190, borderRadius: 20, borderWidth: 1, padding: 18 },
  badgeRow:         { flexDirection: 'row', gap: 8, marginBottom: 12 },
  badge:            { alignSelf: 'flex-start', borderRadius: 7, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText:        { fontSize: 12, fontWeight: '700' },
  courseTitle:      { fontSize: 17, fontWeight: '700', marginBottom: 10 },
  courseMeta:       { fontSize: 14, marginBottom: 8 },
  courseText:       { fontSize: 14, lineHeight: 21, marginTop: 4 },
  divider:          { height: 1, marginHorizontal: 24, marginVertical: 30 },
  bigGrid:          { paddingHorizontal: 24, gap: 14 },
  bigCard:          { borderRadius: 24, borderWidth: 1, padding: 20, minHeight: 140 },
  iconBox:          { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  bigCardTitle:     { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  bigCardText:      { fontSize: 15, lineHeight: 23, marginBottom: 18 },
  bigCardAction:    { fontSize: 14, fontWeight: '700' },
  archiveLinkWrap:  { paddingHorizontal: 24, marginTop: 4, marginBottom: 4 },
  archiveLink:      { fontSize: 14, textDecorationLine: 'underline' },
  modalBackdrop:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', paddingHorizontal: 24 },
  modalCard:        { borderRadius: 24, padding: 24 },
  closeButton:      { position: 'absolute', right: 18, top: 18, width: 38, height: 38, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  modalTitle:       { fontSize: 26, fontWeight: '700', marginBottom: 18 },
  modalText:        { fontSize: 16, marginBottom: 10 },
  modalDescription: { fontSize: 16, lineHeight: 24, marginVertical: 18 },
  modalButton:      { borderRadius: 14, borderWidth: 1, minHeight: 54, alignItems: 'center', justifyContent: 'center' },
  modalButtonText:  { fontSize: 16, fontWeight: '700' },
})

const cardModalStyles = StyleSheet.create({
  titleRow:    { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16, paddingRight: 32 },
  title:       { fontSize: 20, fontWeight: '700', flex: 1, flexWrap: 'wrap' },
  description: { fontSize: 15, lineHeight: 24, marginBottom: 8 },
})
