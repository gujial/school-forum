<template>
    <v-app
        v-if="!colorMode.unknown"
        :theme="theme.global.name.value"
        :class="['background-image', colorMode.value === 'dark' ? 'dark' : 'light']"
    >
        <NavBar />
        <v-main>
            <slot />
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
    import { onMounted, watch } from 'vue';
    import { useTheme } from 'vuetify';
    import NavBar from '../components/NavBar.vue';

    // 获取 colorMode
    const colorMode = useColorMode();
    const theme = useTheme();

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
<style scoped>
    .background-image {
        position: relative;
        min-height: 100vh;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-attachment: fixed;
        overflow: hidden;
    }

    /* 遮罩动画 */
    .background-image::before {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 1; /* 遮罩层在内容下面 */
        background: rgba(255, 255, 255, 0.6);
        transition: background 0.5s ease;
    }

    .background-image.dark::before {
        background: rgba(0, 0, 0, 0.6);
    }

    /* 背景图层（用伪元素叠加才能动画切换） */
    .background-image::after {
        content: '';
        position: absolute;
        inset: 0;
        z-index: 0;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-attachment: fixed;

        opacity: 1;
        transition: opacity 0.8s ease; /* 淡入淡出动画 */
    }

    /* 浅色背景 */
    .background-image.light::after {
        background-image: url('/background_imagelight.jpg');
        opacity: 1;
    }

    /* 深色背景 */
    .background-image.dark::after {
        background-image: url('/background_imagedark.jpg');
        opacity: 1;
    }

    /* 确保内容在遮罩之上 */
    .background-image > * {
        position: relative;
        z-index: 2;
    }
</style>
