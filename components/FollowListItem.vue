<template>
    <v-card
        :image="bgSrc"
        class="d-flex justify-space-between align-center card avatar-bg-mask"
        @click="navigateTo(localePath('/profile/' + props.userId))"
    >
        <div class="bg-mask" />
        <v-row class="align-center" no-gutters>
            <v-col cols="6" sm="auto" class="d-flex">
                <v-avatar size="120" class="mx-2">
                    <v-img cover :src="src" />
                </v-avatar>
            </v-col>
            <v-col cols="6" sm="auto" class="d-flex justify-space-between">
                <div style="color: white">
                    <v-card-title style="z-index: 99; position: relative">
                        {{ user ? user.username : $t('guestUser') }}
                    </v-card-title>
                    <v-card-subtitle v-if="user" style="z-index: 99; position: relative">
                        {{ user.email || $t('clickAccountToLogin') }}
                    </v-card-subtitle>
                </div>
            </v-col>
        </v-row>
        <v-card-actions v-if="props.unfollowable">
            <v-btn style="z-index: 99; position: relative" @click.stop="unfollowUser(props.userId)">
                {{ $t('unfollow') }}
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue';

    interface User {
        user_id: number;
        username: string;
        email?: string;
    }

    interface Props {
        userId: number;
        unfollowable?: boolean;
    }

    const props = defineProps<Props>();
    const emit = defineEmits<{
        (_e: 'unfollow'): void;
    }>();

    const src = ref<string>('/icon.png');
    const bgSrc = ref<string>('/card-image.jpg');
    const user = ref<User | null>(null);

    const localePath = useLocalePath();

    // 获取用户信息
    const updateUser = async () => {
        try {
            const data: { user: User } = await $fetch<{ user: User }>(`/api/user/${props.userId}`);
            user.value = data.user;
        } catch (err) {
            console.error(err);
        }
    };

    // 获取头像
    const updateAvatar = async () => {
        try {
            const data: { data: string } = await $fetch(`/api/avatar/${props.userId}`);
            src.value = data.data || '/icon.png';
        } catch (err) {
            console.error(err);
        }
    };

    // 获取背景
    const updateBg = async () => {
        try {
            const data: { data?: string } = await $fetch(`/api/bg/${props.userId}`);
            bgSrc.value = data.data || '/card-image.jpg';
        } catch (err) {
            bgSrc.value = '/card-image.jpg';
            console.error(err);
        }
    };

    // 取消关注
    const unfollowUser = async (id: number) => {
        try {
            await $fetch(`/api/follow/${id}`, { method: 'DELETE' });
            emit('unfollow');
        } catch (err) {
            console.error(err);
        }
    };

    onMounted(() => {
        updateAvatar();
        updateBg();
        updateUser();
    });
</script>

<style scoped>
    .card {
        padding: 10px;
        position: relative;
        overflow: hidden;
        margin: 10px;
    }

    .bg-mask {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        transition: background 0.3s;
        z-index: 1;
        pointer-events: none;
    }

    .avatar-bg-mask:hover .bg-mask {
        background: rgba(0, 0, 0, 0);
    }

    .v-avatar {
        z-index: 2;
    }
</style>
