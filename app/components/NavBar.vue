<template>
    <v-app-bar app>
        <v-btn icon="mdi-menu" @click="
            () => {
                if (navOpen) {
                    navOpen = false;
                } else {
                    navOpen = true;
                }
            }
        " />
        <v-avatar size="40" class="mx-2" @click="navigateTo(localePath('/'))">
            <v-img cover src="/icon.png" />
        </v-avatar>
        <v-toolbar-title>{{ t('TwitterClone') }}</v-toolbar-title>
    </v-app-bar>
    <v-navigation-drawer v-model="navOpen" :location="display.mobile.value ? 'bottom' : 'left'" temporary>
        <v-card>
            <v-img class="text-white avatar-bg-mask" height="150px" :src="bgSrc" cover>
                <div class="bg-mask" />
                <v-avatar style="z-index: 99; position: relative" size="80" class="mx-2">
                    <v-img cover :src="src" />
                </v-avatar>
                <v-card-title style="z-index: 99; position: relative">{{
                    user && user.username !== 'guest' ? user.username : t('guestUser')
                    }}</v-card-title>
                <v-card-subtitle v-if="user" style="z-index: 99; position: relative">{{
                    user ? user.email : t('clickAccountToLogin')
                    }}</v-card-subtitle>
            </v-img>
        </v-card>

        <v-divider />

        <v-list :lines="false" density="compact" nav>
            <v-list-item :to="localePath('/')" @click="navOpen = false">
                <template #prepend>
                    <v-icon>mdi-home</v-icon>
                </template>
                <v-list-item-title>{{ t('home') }}</v-list-item-title>
            </v-list-item>

            <v-list-item :to="localePath('/account')" @click="navOpen = false">
                <template #prepend>
                    <v-icon>mdi-account</v-icon>
                </template>
                <v-list-item-title>{{ t('account') }}</v-list-item-title>
            </v-list-item>

            <v-list-item :to="localePath('/messages')" @click="navOpen = false">
                <template #prepend>
                    <v-icon>mdi-message-text</v-icon>
                </template>
                <template #append>
                    <v-badge v-if="messageCount > 0" color="primary" :content="messageCount" inline></v-badge>
                </template>
                <v-list-item-title>{{ t('messages') }}</v-list-item-title>
            </v-list-item>
        </v-list>
        <v-btn v-if="user && user.admin" flat style="width: 100%" @click="navigateTo(localePath('/admin'))">{{
            t('adminDashboard') }}</v-btn>
        <v-btn flat icon="mdi-translate" @click="setLocale(locale === 'en' ? 'zh' : 'en')" />
        <v-btn flat @click="toggleTheme()">{{ t(colorMode.preference) }}
            <template #prepend>
                <v-icon>mdi-theme-light-dark</v-icon>
            </template>
        </v-btn>
    </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useTheme, useDisplay } from 'vuetify';
import type { MessageListResponse } from '../../types/models';
import { navigateTo } from '#app';

const colorMode = useColorMode();
const { locale, setLocale } = useI18n();
const localePath = useLocalePath();
const navOpen = shallowRef(false);
const src = ref('/icon.png');
const bgSrc = ref('/card-image.jpg');
const user = useAuthUser();
const theme = useTheme();
const messageCount = ref<number>(0);
const { t } = useI18n();
const display = useDisplay();

const updateAvatar = async () => {
    if (user.value && user.value.user_id === -1) {
        src.value = '/icon.png';
        return;
    }

    try {
        const data = await $fetch<{ data?: string }>('/api/avatar/' + user.value?.user_id);
        src.value = data.data || '/icon.png';
    } catch (err) {
        console.error(err);
    }
};

const updateBg = async () => {
    if (user.value && user.value.user_id === -1) {
        bgSrc.value = '/card-image.jpg';
        return;
    }

    try {
        const data = await $fetch<{ data?: string }>('/api/bg/' + user.value?.user_id);
        bgSrc.value = data.data || '/card-image.jpg';
    } catch {
        bgSrc.value = '/card-image.jpg';
    }
};

const toggleTheme = () => {
    if (colorMode.preference === 'light') {
        colorMode.preference = 'dark';
    } else if (colorMode.preference === 'dark') {
        colorMode.preference = 'system';
    } else {
        colorMode.preference = 'light';
    }
};

const updateMessageCount = async () => {
    try {
        const res = await $fetch<MessageListResponse>('/api/message/get');
        messageCount.value = res.total;
    } catch (err) {
        console.error(err);
    }
};

watch(navOpen, () => {
    updateMessageCount();
});

watch(
    user,
    (val) => {
        if (val) {
            updateAvatar();
            updateBg();
        } else {
            src.value = '/icon.png';
            bgSrc.value = '/card-image.jpg';
        }
    },
    { immediate: true },
);

watch(
    () => colorMode.value,
    (val) => {
        theme.change(val === 'dark' ? 'dark' : 'light');
    },
);
</script>

<style scoped>
.background-image {
    position: relative;
}

.bg-mask {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    /* 黑色半透明 */
    transition: background 0.3s;
    z-index: 1;
    pointer-events: none;
}

.avatar-bg-mask:hover .bg-mask {
    background: rgba(0, 0, 0, 0);
    /* 悬浮时透明 */
}
</style>
