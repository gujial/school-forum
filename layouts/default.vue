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

    // 初始化为系统偏好
    if (colorMode.value === undefined || colorMode.value === null) {
        colorMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }

    // 组件挂载时获取用户信息
    onMounted(async () => {
        await fetchAuthUser();
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
