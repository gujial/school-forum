import type { AuthUser } from '../../types/models';

type AuthUserState = AuthUser | null;

export const useAuthUser = () => useState<AuthUserState>('authUser', () => null);

export const fetchAuthUser = async () => {
    const user = useAuthUser();
    try {
        const data = await $fetch<{ success: boolean; user?: AuthUser }>('/api/auth/user');
        user.value = data.user || null;
    } catch {
        user.value = {
            user_id: -1,
            admin: false,
            username: 'guest',
        };
    }
};
