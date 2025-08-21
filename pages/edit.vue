<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>{{ $t('newTweetEdit') }}</v-card-title>
                    <v-card-text>
                        <v-form>
                            <div id="vditor" />
                        </v-form>
                    </v-card-text>
                    <v-card-text>
                        <TagEditor v-model="tags" />
                    </v-card-text>
                    <MediaEditor ref="mediaEditorRef" />
                    <v-card-actions>
                        <v-btn text @click="postTweet">{{ $t('post') }}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
        <v-alert v-if="error != null" type="error">
            {{ error }}
        </v-alert>
    </v-container>
</template>

<script setup lang="ts">
    import MediaEditor from '~/components/MediaEditor.vue';
    import Vditor from 'vditor';
    import TagEditor from '~/components/TagEditor.vue';
    import 'vditor/dist/index.css';
    import type { AuthUser, ApiResponse } from '~/types/models';

    const user = ref<AuthUser | null>(null);
    const error = ref<string | null>(null);
    const mediaEditorRef = ref<any>(null);
    const localePath = useLocalePath();
    const vditor = ref<Vditor | null>(null);
    const { t, locale } = useI18n();
    const colorMode = useColorMode();
    const attachments = ref<string[]>([]);
    const route = useRoute();
    const parent_id = (route.query.parent_id as string | undefined) || null;
    const tags = ref<string[]>([]);
    const theme = useTheme();

    const postTweet = async () => {
        if (!vditor.value || vditor.value.getValue().trim() === '') {
            error.value = t('contentRequired');
            return;
        }
        try {
            const data = await $fetch<ApiResponse<{ tweet_id: number }>>('/api/tweets/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: vditor.value.getValue(),
                    parent_id: parent_id || undefined,
                    attachments: attachments.value,
                    tags: tags.value,
                }),
            });

            if (mediaEditorRef.value != null && data.data?.tweet_id) {
                mediaEditorRef.value.upload(data.data.tweet_id);
            }
        } catch (err: any) {
            error.value = String(err);
        }
        navigateTo(localePath('/'));
    };

    onMounted(async () => {
        vditor.value = new Vditor('vditor', {
            placeholder: t('content'),
            theme: colorMode.value === 'dark' ? 'dark' : 'classic',
            lang: locale.value === 'en' ? 'en_US' : 'zh_CN',
            upload: {
                url: '/api/media/upload',
                accept: 'image/*',
                token: useCookie('token').value || undefined,
                async handler(files) {
                    let res: any;
                    for (const file of files) {
                        const name = file.name;
                        const formData = new FormData();
                        formData.append('file', file);
                        res = await $fetch<{ filePath: string }>('/api/media/upload', {
                            method: 'POST',
                            body: formData,
                        });
                        if (vditor.value) {
                            vditor.value.insertValue(`![${name}](${res.filePath})`);
                        }
                        attachments.value.push(res.filePath);
                    }
                    if (res?.filePath) {
                        return '上传成功';
                    }
                    return '上传失败';
                },
            },
            after: () => {
                if (vditor.value) {
                    vditor.value.setTheme(
                        theme.global.name.value === 'dark' ? 'dark' : 'classic',
                        theme.global.name.value === 'dark' ? 'dark' : 'light',
                    );
                }
            },
        });
        try {
            const data = await $fetch<{ success: boolean; user?: AuthUser }>('/api/auth/user');
            user.value = data.user || null;
        } catch (err: any) {
            if (err.statusCode == 401) {
                navigateTo(localePath('/login'));
            } else {
                error.value = String(err);
            }
        }
    });

    onUnmounted(() => {
        if (vditor.value) {
            vditor.value.destroy();
        }
    });
</script>
<style scoped>
    .vditor--fullscreen {
        margin-top: 70px;
        height: 92vh !important;
    }
</style>
