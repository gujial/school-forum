<template>
    <div ref="container"></div>
</template>

<script setup lang="ts">
    import { ref, onMounted, watch } from 'vue';
    import Vditor from 'vditor';
    import { useColorMode } from '@vueuse/core';
    import 'vditor/dist/index.css';

    interface Props {
        md: string;
    }
    const props = defineProps<Props>();

    const container = ref<HTMLDivElement | null>(null);
    const colorMode = useColorMode();

    const render = () => {
        if (!container.value) return;

        Vditor.preview(container.value, props.md, {
            mode: colorMode.value === 'dark' ? 'dark' : 'light',
            hljs: { style: colorMode.value === 'dark' ? 'github-dark' : 'github' },
            theme: {
                current: colorMode.value === 'dark' ? 'dark' : 'classic',
            },
            transform: (html) => {
                const imgRegex = /<img[^>]*>/g;
                return html.replace(imgRegex, () => `[图片]`);
            },
        });
    };

    onMounted(render);

    // 监听 markdown 和主题变化
    watch(
        () => [props.md, colorMode.value],
        () => render(),
        { deep: true },
    );
</script>
