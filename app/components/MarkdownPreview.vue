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

    const getPreviewMarkdown = (md: string, maxBlocks = 4) => {
        const blocks: string[] = [];
        const lines = md.split(/\r?\n/);
        let buffer: string[] = [];
        let inCodeBlock = false;

        for (const line of lines) {
            if (line.startsWith('```')) {
                inCodeBlock = !inCodeBlock;
                buffer.push(line);
                if (!inCodeBlock) {
                    blocks.push(buffer.join('\n'));
                    buffer = [];
                }
                continue;
            }

            if (inCodeBlock) {
                buffer.push(line);
                continue;
            }

            // 普通行或 HTML
            buffer.push(line);
            // 如果遇到空行或 HTML 结束标签
            if (line.trim() === '' || line.trim().endsWith('>')) {
                blocks.push(buffer.join('\n'));
                buffer = [];
            }

            if (blocks.length >= maxBlocks) break;
        }

        // 收尾
        if (buffer.length && blocks.length < maxBlocks) {
            blocks.push(buffer.join('\n'));
        }

        return blocks.slice(0, maxBlocks).join('\n');
    };

    const render = () => {
        if (!container.value) return;

        const previewMd = getPreviewMarkdown(props.md);

        Vditor.preview(container.value, previewMd, {
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
                            return `<iframe src="${url.href + '&autoplay=0&quality=480p&danmaku=0'}" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="false" width="100%" height="250px"></iframe>`;
                        } else {
                            throw createError('未找到对应图片');
                        }

                        return `<img src="${thumbnail}" alt="iframe preview" cover />`;
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
