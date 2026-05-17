<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <v-card>
                    <v-card-title class="d-flex align-center justify-space-between">
                        <span>帖子数据报告</span>
                        <v-btn
                            color="primary"
                            prepend-icon="mdi-file-chart"
                            :loading="loading"
                            @click="generateReport"
                        >
                            生成报告
                        </v-btn>
                    </v-card-title>

                    <v-card-subtitle>
                        通过管理员接口实时生成论坛帖子报告，并使用 Vditor 预览（含 echarts 语法）。
                    </v-card-subtitle>

                    <v-card-text>
                        <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
                        <v-alert v-if="generatedAt" type="success" class="mb-4">
                            最近生成时间：{{ new Date(generatedAt).toLocaleString() }}
                        </v-alert>

                        <v-textarea
                            v-model="markdown"
                            label="Markdown 源码"
                            variant="outlined"
                            auto-grow
                            rows="8"
                            class="mb-4"
                        />

                        <v-divider class="mb-4" />

                        <Markdown v-if="markdown" :md="markdown" />
                        <v-alert v-else type="info">点击“生成报告”后将在此处预览。</v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
    import Markdown from '../../components/Markdown.vue';

    interface AdminPostReportResponse {
        success: boolean;
        message?: string;
        data?: {
            markdown: string;
            generatedAt: string;
        };
    }

    const loading = ref(false);
    const markdown = ref('');
    const generatedAt = ref('');
    const error = ref('');

    const currentUser = useAuthUser();
    const localePath = useLocalePath();

    const generateReport = async () => {
        loading.value = true;
        error.value = '';

        try {
            const res = await $fetch<AdminPostReportResponse>('/api/admin/post_report');
            if (!res.success || !res.data) {
                throw new Error(res.message || '生成失败');
            }

            markdown.value = res.data.markdown;
            generatedAt.value = res.data.generatedAt;
        } catch (err: any) {
            console.error(err);
            error.value = err?.message || '生成报告失败';
        } finally {
            loading.value = false;
        }
    };

    onMounted(() => {
        if (currentUser.value !== null && !currentUser.value.admin) {
            navigateTo(localePath('/forbidden'));
            return;
        }
        generateReport();
    });
</script>
