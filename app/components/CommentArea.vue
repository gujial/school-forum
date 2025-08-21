<template>
    <v-alert v-if="error != null" type="error">
        {{ error }}
    </v-alert>
    <v-alert v-if="suc != null" type="success">
        {{ suc }}
    </v-alert>
    <v-alert v-if="currentUser && currentUser.user_id === -1">
        {{ t('pleaseLogin') }}
    </v-alert>
    <v-card-text v-if="comments.length == 0">{{ t('noComments') }}</v-card-text>
    <div v-else-if="ready">
        <v-btn variant="flat" @click="toggleApi">{{
            commentApi == 'order_by_time' ? t('timeDesc') : t('timeAsc')
        }}</v-btn>
        <v-card
            v-for="(comment, index) in comments"
            :id="`comment-${comment.comment_id}`"
            :key="comment.comment_id"
            :title="users[index]?.username"
            :subtitle="
                moment.utc(comment.created_at).tz(userTimeZone).format('YYYY-MM-DD HH:mm:ss')
            "
            :variant="'flat'"
        >
            <template #prepend>
                <v-avatar size="40" @click="navigateTo(`/profile/${users[index]?.user_id}`)">
                    <v-img v-if="avatars[index]" :src="avatars[index]" />
                </v-avatar>
            </template>
            <v-card-text>
                {{ comment.content }}
                <v-card-actions>
                    <v-btn
                        v-if="currentUser && currentUser.user_id !== -1"
                        @click="showReplyBox(comment.comment_id)"
                        >{{ t('reply') }}</v-btn
                    >
                    <v-btn
                        v-if="currentUser && currentUser.user_id !== -1"
                        @click="openCommentReportDialog(comment.comment_id)"
                        >{{ t('report') }}</v-btn
                    >
                    <v-btn
                        v-if="
                            currentUser &&
                            (currentUser.user_id === users[index]?.user_id || currentUser.admin)
                        "
                        color="red"
                        variant="text"
                        @click="showDeleteDialog(comment)"
                    >
                        {{ t('delete') }}
                    </v-btn>
                </v-card-actions>
                <!-- 二级评论展示 -->
                <div v-if="comment.replies && comment.replies.length > 0" class="reply-list">
                    <v-card
                        v-for="reply in comment.replies"
                        :id="`comment-${reply.comment_id}`"
                        :key="reply.comment_id"
                        class="ml-6 mb-2"
                        variant="tonal"
                        density="compact"
                    >
                        <v-card-title class="text-caption d-flex align-center">
                            <v-avatar size="24" class="mr-2">
                                <v-img v-if="reply.avatar" :src="reply.avatar" />
                            </v-avatar>
                            {{ reply.username }}
                            <span class="ml-2 text-caption">
                                {{
                                    moment
                                        .utc(reply.created_at)
                                        .tz(userTimeZone)
                                        .format('YYYY-MM-DD HH:mm:ss')
                                }}
                            </span>
                        </v-card-title>
                        <v-card-text class="text-body-2">{{ reply.content }}</v-card-text>
                        <v-card-actions>
                            <v-btn
                                v-if="currentUser && currentUser.user_id !== -1"
                                @click="openCommentReportDialog(reply.comment_id)"
                                >{{ t('report') }}</v-btn
                            >
                            <v-btn
                                v-if="currentUser && currentUser.user_id === reply.user_id"
                                color="red"
                                variant="text"
                                @click="showDeleteDialog(reply)"
                            >
                                {{ t('delete') }}
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </div>
                <!-- 回复输入框 -->
                <div v-if="replyBoxVisible === comment.comment_id" class="mt-2">
                    <v-textarea v-model="replyContent" :label="t('replyContent')" auto-grow />
                    <v-btn
                        size="small"
                        variant="flat"
                        @click="submitReply(comment.comment_id, comment.user_id)"
                        >{{ t('submit') }}</v-btn
                    >
                    <v-btn size="small" variant="flat" @click="replyBoxVisible = null">{{
                        t('cancel')
                    }}</v-btn>
                </div>
            </v-card-text>
        </v-card>
        <v-pagination v-model="currentPage" :length="pageCount" />
    </div>

    <v-dialog v-model="showDelete" max-width="400">
        <v-card>
            <v-card-title>{{ t('deleteComment') }}</v-card-title>
            <v-card-text
                >{{ commentToDelete?.content }} ({{
                    commentToDelete?.created_at
                        ? moment
                              .utc(commentToDelete.created_at)
                              .tz(userTimeZone)
                              .format('YYYY-MM-DD HH:mm:ss')
                        : ''
                }})</v-card-text
            >
            <v-divider />
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="showDelete = false">{{ t('cancel') }}</v-btn>
                <v-btn color="red" @click="handleDeleteConfirm">{{ t('confirm') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="reportDialog" max-width="400">
        <v-card>
            <v-card-title class="headline">{{ t('confirmReport') }}</v-card-title>
            <v-card-text>{{ t('confirmReportMsg') || '确定要举报这条评论吗？' }}</v-card-text>
            <v-text-field v-model="reportContent" :label="t('reportContent')" :rules="[required]" />
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="reportDialog = false">{{ t('cancel') }}</v-btn>
                <v-btn color="error" text @click="confirmReport">{{ t('report') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
    import moment from 'moment-timezone';
    import type { Comment, User } from '../../types/models';
    import { navigateTo } from '#app';

    const props = defineProps<{
        tweetId: number;
    }>();
    const error = ref<string | null>(null);
    const comments = ref<Comment[]>([]);
    const users = ref<User[]>([]);
    const avatars = ref<string[]>([]);
    const ready = ref<boolean>(false);
    const currentPage = ref<number>(1);
    const pageCount = ref<number>(1);
    const currentUser = useAuthUser();
    const replyBoxVisible = ref<number | null>(null);
    const replyContent = ref<string>('');
    const showDelete = ref<boolean>(false);
    const commentToDelete = ref<Comment | null>(null);
    const commentApi = ref<string>('order_by_time');
    const reportDialog = ref<boolean>(false);
    const reportCommentId = ref<number | null>(null);
    const reportContent = ref<string>('');
    const suc = ref<string | null>(null);
    const { t } = useI18n();

    const required = (v: string) => !!v || t('fieldIsRequired');

    const openCommentReportDialog = (commentId: number) => {
        reportDialog.value = true;
        reportCommentId.value = commentId;
    };

    const confirmReport = async () => {
        try {
            if (!reportContent.value || reportContent.value === '') {
                throw t('contentRequired');
            }

            const res = await $fetch(`/api/report/comment/${reportCommentId.value}`, {
                method: 'POST',
                body: JSON.stringify({
                    content: reportContent.value,
                    tweet_id: props.tweetId,
                }),
            });

            if (!res.success) {
                throw res.message;
            } else {
                suc.value = t('reportSuccess');
            }
        } catch (err: unknown) {
            error.value = String(err);
        } finally {
            reportDialog.value = false;
            reportContent.value = '';
            reportCommentId.value = null;
        }
    };

    const toggleApi = () => {
        if (commentApi.value == 'order_by_time') {
            commentApi.value = 'by_tweet';
        } else {
            commentApi.value = 'order_by_time';
        }
        updateComments();
    };

    const showReplyBox = (commentId: number) => {
        replyBoxVisible.value = commentId;
        replyContent.value = '';
    };

    const handleDelete = async (commentId: number) => {
        try {
            await $fetch(`/api/comment/${commentId}`, {
                method: 'DELETE',
            });
            updateComments();
        } catch (err: unknown) {
            error.value = String(err);
        }
    };

    const submitReply = async (parentCommentId: number, parentUserId: number) => {
        if (!replyContent.value.trim()) return;
        try {
            await $fetch('/api/comment/reply', {
                method: 'POST',
                body: {
                    tweet_id: props.tweetId,
                    parent_id: parentCommentId,
                    content: replyContent.value,
                },
            });

            await $fetch('/api/message/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tweet_id: props.tweetId,
                    comment_id: parentCommentId,
                    receiver_id: parentUserId,
                    content: replyContent.value,
                }),
            });

            replyBoxVisible.value = null;
            replyContent.value = '';
            updateComments();
        } catch (err: unknown) {
            error.value = String(err);
        }
    };

    const updateComments = async () => {
        ready.value = false;
        try {
            const data = await $fetch<{
                success: boolean;
                data?: Comment[];
                maxPages?: number;
                message?: string;
            }>(`/api/comment/${commentApi.value}/${props['tweetId']}?page=${currentPage.value}`);
            if (!data.success) {
                throw createError(data.message || '获取评论失败');
            }

            pageCount.value = data.maxPages || 1;
            comments.value = data.data || [];

            // 获取用户和头像
            const userPromises = comments.value.map((comment) =>
                $fetch<{ success: boolean; user?: User }>(`/api/user/${comment.user_id}`),
            );
            const avatarPromises = comments.value.map((comment) =>
                $fetch<{ success: boolean; data?: string }>(`/api/avatar/${comment.user_id}`),
            );
            const usersData = await Promise.all(userPromises);
            const avatarsData = await Promise.all(avatarPromises);
            users.value = usersData.map((userResponse) => userResponse.user || ({} as User));
            avatars.value = avatarsData.map((avatarResponse) => avatarResponse.data || '');

            // 获取二级评论
            for (const comment of comments.value) {
                const replyRes = await $fetch<{ success: boolean; data?: Comment[] }>(
                    `/api/comment/replies/${comment.comment_id}`,
                );
                if (replyRes.success && replyRes.data) {
                    // 并发获取每个二级评论的用户和头像
                    const replyUsers = await Promise.all(
                        replyRes.data.map((r: Comment) =>
                            $fetch<{ success: boolean; user?: User }>(`/api/user/${r.user_id}`),
                        ),
                    );
                    const replyAvatars = await Promise.all(
                        replyRes.data.map((r: Comment) =>
                            $fetch<{ success: boolean; data?: string }>(`/api/avatar/${r.user_id}`),
                        ),
                    );
                    comment.replies = replyRes.data.map((r: Comment, idx: number) => ({
                        ...r,
                        username: replyUsers[idx]?.user?.username || '',
                        avatar: replyAvatars[idx]?.data || '',
                    }));
                } else {
                    comment.replies = [];
                }
            }

            ready.value = true;

            nextTick(() => {
                const hash = window.location.hash;
                if (hash && hash.startsWith('#comment-')) {
                    const target = document.querySelector(hash);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        target.classList.add('highlight-comment');
                        setTimeout(() => target.classList.remove('highlight-comment'), 2000);
                    }
                }
            });
        } catch (err: unknown) {
            error.value = String(err);
        }
    };

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    watch(currentPage, updateComments);
    onMounted(() => {
        updateComments();
    });
    defineExpose({ updateComments });

    const handleDeleteConfirm = () => {
        if (commentToDelete.value) {
            handleDelete(commentToDelete.value.comment_id);
        }
        showDelete.value = false;
    };

    const showDeleteDialog = (comment: Comment) => {
        commentToDelete.value = comment;
        showDelete.value = true;
    };

    watch(suc, () => {
        if (suc.value) {
            setTimeout(() => {
                suc.value = null;
            }, 2000);
        }
    });

    watch(error, () => {
        if (error.value) {
            setTimeout(() => {
                error.value = null;
            }, 2000);
        }
    });
</script>

<style scoped>
    .reply-list {
        margin-top: 8px;
    }

    .highlight-comment {
        animation: flash-bg 1s ease-in-out 2;
    }

    @keyframes flash-bg {
        0%,
        100% {
            background-color: transparent;
        }

        50% {
            background-color: rgba(255, 255, 0, 0.3);
        }
    }
</style>
