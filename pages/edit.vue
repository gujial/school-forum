<!--
这段Vue代码实现了一个发布推文的页面。主要功能包括：

    1、使用Vditor富文本编辑器撰写推文内容；
    2、支持上传图片等附件；
    3、提交推文时调用API发送内容和附件信息；
    4、包含错误处理和用户身份验证逻辑；
    5、页面加载时初始化编辑器并获取当前用户信息；
    6、支持国际化（多语言）和暗色主题适配。-->
<template>
    <v-container>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>{{ $t('newTweetEdit') }}</v-card-title>
                    <v-card-text>
                        <v-form>
                            <div id="vditor"></div>
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

<script setup>
import MediaEditor from '~/components/MediaEditor.vue';
import Vditor from 'vditor';
import TagEditor from '~/components/TagEditor.vue';
import 'vditor/dist/index.css';

const user = ref(null)
const error = ref(null)
const mediaEditorRef = ref(null);
const localePath = useLocalePath()
const vditor = ref(null);
const { t, locale } = useI18n()
const colorMode = useColorMode();
const attachments = ref([])
const route = useRoute()
const parent_id = route.query.parent_id || null;
const tags = ref([]);
const theme = useTheme()

const postTweet = async () => {
    if (!vditor.value || vditor.value.getValue().trim() === '') {
        error.value = t('contentRequired');
        return;
    }
    try {
        const data = await $fetch('/api/tweets/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: vditor.value.getValue(),
                parent_id: parent_id,
                attachments: attachments.value,
                tags: tags.value
            })
        })

        if (mediaEditorRef.value != null) {
            mediaEditorRef.value.upload(data.tweet_id)
        }
    } catch (err) {
        error.value = err
    }
    navigateTo(localePath('/'))
}

onMounted(async () => {
    vditor.value = new Vditor('vditor', {
        placeholder: t('content'),
        theme: colorMode.value === 'dark' ? 'dark' : 'classic',
        lang: locale.value === 'en' ? 'en_US' : 'zh_CN',
        upload: {
            url: '/api/media/upload',
            method: 'POST',
            accept: 'image/*',
            token: useCookie('token').value,
            async handler(files) {
                let res;
                for (const file of files) {
                    const name = file.name;
                    const formData = new FormData();
                    formData.append('file', file);
                    res = await $fetch('/api/media/upload', {
                        method: 'POST',
                        body: formData,
                    });
                    vditor.value.insertValue(`![${name}](${res.filePath})`);
                    attachments.value.push(res.filePath);
                }
                if (res.filePath) {
                    return '上传成功';
                }
                return '上传失败';
            },
        },
        after: () => {
            vditor.value.setTheme(
                theme.global.name.value === 'dark' ? 'dark' : 'classic',
                theme.global.name.value === 'dark' ? 'dark' : 'light'
            );
        }
    });
    try {
        const data = await $fetch('/api/auth/user');
        user.value = data.user;
    } catch (err) {
        if (err.statusCode == 401) {
            navigateTo(localePath('/login'))
        } else {
            error.value = err
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