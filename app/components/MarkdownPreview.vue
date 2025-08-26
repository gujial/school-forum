<template>
    <div ref="container"></div>
</template>

<script setup lang="ts">
    import { ref, onMounted, watch } from 'vue';
    import Vditor from 'vditor';
    import 'vditor/dist/index.css';
    import { useTheme } from 'vuetify';
    const { t } = useI18n();

    interface Props {
        md: string;
    }
    const props = defineProps<Props>();

    const container = ref<HTMLDivElement | null>(null);
    const theme = useTheme();

    const render = () => {
        if (!container.value) return;

        Vditor.preview(container.value, props.md, {
            mode: theme.global.name.value === 'dark' ? 'dark' : 'light',
            hljs: { style: theme.global.name.value === 'dark' ? 'github-dark' : 'github' },
            theme: {
                current: theme.global.name.value === 'dark' ? 'dark' : 'classic',
            },
            transform: (html) => {
                const imgRegex = /<img[^>]*>/g;
                const tocRegex = /\[toc\]/g;
                const iframeRegex = /<iframe[^>]*>/g;
                html = html.replace(tocRegex, () => `[${t('toc')}]`);
                html = html.replace(imgRegex, () => `[${t('image')}]`);
                html = html.replace(iframeRegex, () => `[iframe]`);
                return html;
            },
        });
    };

    onMounted(render);

    // 监听 markdown 和主题变化
    watch(
        () => [props.md, theme.global.name.value],
        () => render(),
        { deep: true },
    );
</script>
