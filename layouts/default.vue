<template>
    <v-app v-if="!$colorMode.unknown" :theme="theme.global.name">
        <NavBar />
        <v-main>
            <slot />
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
    import { watch } from 'vue';
    import { useColorMode } from '@vueuse/core';
    import { useTheme } from 'vuetify';
    import NavBar from '~/components/NavBar.vue';

    const colorMode = useColorMode({ preference: 'system' });
    const theme = useTheme();

    onMounted(async () => {
        await fetchAuthUser();
    });

    watch(
        () => colorMode.value,
        (val) => {
            theme.change(val === 'dark' ? 'dark' : 'light');
        },
        { immediate: true },
    );
</script>
