<template>
    <v-app v-if="!$colorMode.unknown" :theme="theme.global.name.value">
        <NavBar />
        <v-main>
            <slot />
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
    import { onMounted, watch } from 'vue';
    import { useColorMode } from '@vueuse/core';
    import { useTheme } from 'vuetify';
    import NavBar from '~/components/NavBar.vue';

    // 获取 colorMode
    const colorMode = useColorMode();
    const theme = useTheme();

    // 组件挂载时获取用户信息
    onMounted(async () => {
        await fetchAuthUser();
        if (localStorage.getItem('nuxt-color-mode') === 'light') {
            colorMode.value = 'light'
        } else if (localStorage.getItem('nuxt-color-mode') === 'dark') {
            colorMode.value = 'dark'
        }
    });

    // 响应暗/亮主题变化
    watch(
        () => colorMode.value,
        (val) => {
            theme.change(val === 'dark' ? 'dark' : 'light');
        },
        { immediate: true },
    );
</script>
