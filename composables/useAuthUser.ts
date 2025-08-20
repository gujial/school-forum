type AuthUser = {
  user_id: number
  username: string
  email?: string
  admin?: boolean
  created_at?: string
} | null

export const useAuthUser = () => useState<AuthUser>('authUser', () => null)

export const fetchAuthUser = async () => {
  const user = useAuthUser()
  try {
    const data = await $fetch<{ success: boolean; user?: NonNullable<AuthUser> }>('/api/auth/user')
    user.value = data.user || null
  } catch {
    user.value = {
      user_id: -1,
      admin: false,
      username: 'guest'
    }
  }
}