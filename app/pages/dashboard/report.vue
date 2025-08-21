<template>
    <v-container>
        <v-card>
            <v-card-title>
                {{ t('reportManage') }}
            </v-card-title>
            <v-card-text>
                <v-data-table
                    :headers="headers"
                    :items="reports"
                    :loading="loading"
                    item-value="report_id"
                    class="elevation-1"
                >
                    <template #item.created_at="{ item }">
                        {{ new Date(item.created_at || '').toLocaleString() }}
                    </template>

                    <template #item.user="{ item }">
                        <v-btn v-if="item.user_id" flat :to="`/profile/${item.user_id}`">{{
                            usernames?.[item.user_id ?? ''] || 'Loading...'
                        }}</v-btn>
                        <span v-else>{{ t('AIReports') }}</span>
                    </template>

                    <template #item.tweet_id="{ item }">
                        <v-btn
                            v-if="item.tweet_id"
                            flat
                            :to="`/detail/${item.tweet_id}?from=${route.path}`"
                            >{{ item.tweet_id }}</v-btn
                        >
                        <span v-else>-</span>
                    </template>

                    <template #item.comment_id="{ item }">
                        <v-btn
                            v-if="item.comment_id"
                            flat
                            :to="`/detail/${item.tweet_id}#comment-${item.comment_id}`"
                            >{{ item.comment_id }}</v-btn
                        >
                        <span v-else>-</span>
                    </template>

                    <template #item.actions="{ item }">
                        <div class="d-flex ga-2 justify-end">
                            <v-icon
                                color="medium-emphasis"
                                icon="mdi-delete"
                                size="small"
                                @click="deleteReport(item.report_id)"
                            />
                        </div>
                    </template>
                </v-data-table>
                <v-btn
                    class="me-2"
                    prepend-icon="mdi-delete"
                    rounded="lg"
                    color="red"
                    :text="t('deleteAllReports')"
                    @click="deleteAllReports"
                />
            </v-card-text>

            <v-card-actions class="justify-center">
                <v-pagination v-model="page" :length="maxPages" total-visible="7" />
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
    import { ref, watch, onMounted } from 'vue';
    import { useI18n } from 'vue-i18n';
    import type { Report, ReportListResponse, UserApiResponse } from '../../../types/models';

    const { t } = useI18n();
    const page = ref<number>(1);
    const pageSize = 20;
    const maxPages = ref<number>(1);
    const reports = ref<Report[]>([]);
    const loading = ref<boolean>(false);
    const usernames = ref<Record<number, string>>({});
    const currentUser = useAuthUser();
    const localePath = useLocalePath();
    const route = useRoute();

    const headers = [
        { title: t('user'), value: 'user', sortable: true },
        { title: t('tweetId'), value: 'tweet_id', sortable: true },
        { title: t('commentId'), value: 'comment_id', sortable: true },
        { title: t('content'), value: 'content', sortable: true },
        { title: t('createdAt'), value: 'created_at', sortable: true },
        { title: t('actions'), value: 'actions', sortable: false },
    ];

    async function fetchReports() {
        loading.value = true;

        try {
            const data = await $fetch<ReportListResponse>(`/api/admin/report/list`, {
                params: {
                    page: page.value,
                    pageSize,
                },
            });

            if (data.success) {
                reports.value = data.data || [];
                maxPages.value = data.maxPages;
            } else {
                reports.value = [];
                maxPages.value = 1;
            }
        } catch (error: unknown) {
            console.error('Error fetching reports:', error);
            reports.value = [];
            maxPages.value = 1;
            loading.value = false;
            return;
        }
        loading.value = false;
    }

    async function loadUsername(id: number) {
        if (!id) {
            usernames.value[id] = t('AIReports');
            return;
        }
        if (usernames.value[id]) return;
        try {
            const response = await $fetch<UserApiResponse>(`/api/user/${id}`);
            const username = response?.user?.username;
            usernames.value[id] = username ? username : 'Unknown User';
        } catch {
            usernames.value[id] = 'Unknown User';
        }
    }

    const deleteAllReports = async () => {
        try {
            await $fetch(`/api/admin/report/delete_all`, { method: 'DELETE' });
            reports.value = [];
            maxPages.value = 1;
        } catch (error: unknown) {
            console.error('Error deleting reports:', error);
        }
    };

    const deleteReport = async (reportId: number) => {
        try {
            await $fetch(`/api/admin/report/${reportId}`, { method: 'DELETE' });
            fetchReports();
        } catch (error: unknown) {
            console.error('Error deleting report:', error);
        }
    };

    watch(reports, (reports) => {
        reports.forEach((report: Report) => {
            if (report.user_id) {
                loadUsername(report.user_id);
            }
        });
    });

    onMounted(() => {
        if (currentUser.value && currentUser.value.user_id === -1) {
            navigateTo(localePath('/login'));
        }
        fetchReports();
    });
</script>
