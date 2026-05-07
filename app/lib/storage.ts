import * as SecureStore from 'expo-secure-store'
import { User } from '@/context/AuthContext'

const TOKEN_KEY = 'uro_token'
const USER_KEY  = 'uro_user'

export const storage = {
  getToken: (): Promise<string | null> => SecureStore.getItemAsync(TOKEN_KEY),
  setToken: (t: string): Promise<void>  => SecureStore.setItemAsync(TOKEN_KEY, t),
  clearToken: (): Promise<void>          => SecureStore.deleteItemAsync(TOKEN_KEY),

  getUser: async (): Promise<User | null> => {
    const raw = await SecureStore.getItemAsync(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  },
  setUser:  (u: User): Promise<void> => SecureStore.setItemAsync(USER_KEY, JSON.stringify(u)),
  clearUser: (): Promise<void>        => SecureStore.deleteItemAsync(USER_KEY),
}
