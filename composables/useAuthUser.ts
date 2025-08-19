export const useAuthUser = () => useState<any>('authUser', () => null)

export const fetchAuthUser = async () => {
  const user = useAuthUser()
  try {
    const data = <any>await $fetch('/api/auth/user')
    user.value = data.user || null
  } catch {
    user.value = {
      user_id: -1,
      admin: false,
      username: 'guest'
    }
  }
}