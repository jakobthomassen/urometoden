import { useEffect, useState } from 'react'
import { Modal, View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useTheme } from '@/components/ui/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/api'
import Text from '@/components/ui/Text'

type Entry = {
  id:          number
  prompt_date: string
  body:        string
  updated_at:  number
  prompt_body: string | null
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('nb-NO', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function DailyReflectionArchiveModal({ onClose }: { onClose: () => void }) {
  const { colors: C } = useTheme()
  const { token }     = useAuth()
  const [items, setItems]     = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/api/me/daily-reflections', {}, token)
      .then(r => r.ok ? r.json() : [])
      .then((data: Entry[]) => { setItems(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [token])

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: C.background }]}>

        <View style={[styles.header, { borderBottomColor: C.border }]}>
          <Text style={[styles.headerTitle, { color: C.text }]}>Refleksjonshistorikk</Text>
          <TouchableOpacity onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={C.mutedText} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={C.primary} style={{ marginTop: 40 }} />
        ) : items.length === 0 ? (
          <Text style={[styles.empty, { color: C.mutedText }]}>Ingen refleksjoner ennå.</Text>
        ) : (
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {items.map(item => (
              <View key={item.id} style={[styles.item, { borderBottomColor: C.border }]}>
                <Text style={[styles.itemDate, { color: C.mutedText }]}>
                  {formatDate(item.prompt_date)}
                </Text>
                {item.prompt_body ? (
                  <Text style={[styles.itemPrompt, { color: C.subtleText }]}>{item.prompt_body}</Text>
                ) : null}
                <Text style={[styles.itemBody, { color: C.text }]}>{item.body}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  closeBtn:    { padding: 4 },
  empty:       { textAlign: 'center', marginTop: 60, fontSize: 15 },
  list:        { paddingBottom: 40 },
  item:        { paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1 },
  itemDate:    { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 },
  itemPrompt:  { fontSize: 13, fontStyle: 'italic', lineHeight: 20, marginBottom: 8 },
  itemBody:    { fontSize: 15, lineHeight: 24 },
})
