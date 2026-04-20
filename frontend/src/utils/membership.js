export function isMember(user) {
  if (!user) return false
  const now = Date.now()
  if (user.membership === 'member') return !user.membership_expires_at || user.membership_expires_at > now
  if (user.membership === 'trial')  return !!user.membership_expires_at && user.membership_expires_at > now
  return false
}
