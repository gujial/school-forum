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
                const tocRegex = /\[toc\]/g;
                const iframeRegex = /<iframe[^>]*src=["']([^"']+)["'][^>]*><\/iframe>/g;
                html = html.replace(iframeRegex, (_, src) => {
                    try {
                        const url = new URL(src);
                        const hostname = url.hostname;

                        let thumbnail = '';
                        // Todo: 支持更多网站
                        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
                            // YouTube 缩略图
                            const videoId =
                                url.searchParams.get('v') || url.pathname.split('/').pop();
                            thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                        } else if (hostname.includes('bilibili.com')) {
                            return `<iframe src="${url.href + '&autoplay=0'}" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="false" width="100%" height="250px"></iframe>`;
                        } else {
                            throw createError('未找到对应图片');
                        }

                        return `<img src="${thumbnail}" alt="iframe preview" />`;
                    } catch {
                        return `[iframe]`;
                    }
                });
                html = html.replace(tocRegex, () => `[${t('toc')}]`);
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
<style scoped>
    .iframe-placeholder {
        position: relative;
        display: inline-block;
        cursor: pointer;
    }
    .iframe-placeholder img {
        max-width: 100%;
        border-radius: 8px;
    }
    .iframe-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.3);
        color: white;
        font-size: 20px;
    }
</style>
