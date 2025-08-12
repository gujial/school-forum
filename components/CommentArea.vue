<!--
这段Vue代码实现了一个评论组件，支持分页加载、评论排序（按时间升序/降序）、回复功能及删除评论。主要逻辑包括：

    1、使用v-for渲染评论及二级回复；
    2、提供回复输入框与提交功能；
    3、支持删除评论并弹窗确认；
    4、通过API获取评论、用户信息和头像；
    5、使用moment处理时区转换显示时间；
    6、分页和排序切换功能。-->

<template>
    <v-alert v-if="error != null" type="error">
        {{ error }}
    </v-alert>
    <v-card-text v-if="comments.length == 0">{{ $t('noComments') }}</v-card-text>
    <div v-else-if="ready">
        <v-btn variant="flat" @click="toggleApi">{{ commentApi == 'order_by_time' ? $t('timeDesc') : $t('timeAsc') }}</v-btn>
        <v-card v-for="(comment, index) in comments" :key="comment.comment_id" :title="users[index].username"
            :subtitle="moment.utc(comment.created_at).tz(userTimeZone).format('YYYY-MM-DD HH:mm:ss')" :variant="'flat'">
            <template #prepend>
                <v-avatar size="40" @click="navigateTo(`/profile/${users[index].user_id}`)">
                    <v-img v-if="avatars[index]" :src="avatars[index]" />
                </v-avatar>
            </template>
            <v-card-text>
                {{ comment.content }}
                <v-card-actions>
                    <v-btn @click="showReplyBox(comment.comment_id)">{{ $t('reply') }}</v-btn>
                    <v-btn v-if="currentUserId === users[index].user_id" color="red" variant="text"
                        @click="showDeleteDialog(comment)">
                        {{ $t('delete') }}
                    </v-btn>
                </v-card-actions>
                <!-- 二级评论展示 -->
                <div v-if="comment.replies && comment.replies.length > 0" class="reply-list">
                    <v-card v-for="reply in comment.replies" :key="reply.comment_id" class="ml-6 mb-2" variant="tonal"
                        density="compact">
                        <v-card-title class="text-caption d-flex align-center">
                            <v-avatar size="24" class="mr-2">
                                <v-img v-if="reply.avatar" :src="reply.avatar" />
                            </v-avatar>
                            {{ reply.username }}
                            <span class="ml-2 text-caption">
                                {{ moment.utc(reply.created_at).tz(userTimeZone).format('YYYY-MM-DD HH:mm:ss') }}
                            </span>
                        </v-card-title>
                        <v-card-text class="text-body-2">{{ reply.content }}</v-card-text>
                        <v-card-actions>
                            <v-btn v-if="currentUserId === users[index].user_id" color="red" variant="text"
                                @click="showDeleteDialog(reply)">
                                {{ $t('delete') }}
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </div>
                <!-- 回复输入框 -->
                <div v-if="replyBoxVisible === comment.comment_id" class="mt-2">
                    <v-textarea v-model="replyContent" :label="$t('replyContent')" auto-grow />
                    <v-btn size="small" variant="flat" @click="submitReply(comment.comment_id)">{{ $t('submit') }}</v-btn>
                    <v-btn size="small" variant="flat" @click="replyBoxVisible = null">{{ $t('cancel') }}</v-btn>
                </div>
            </v-card-text>
        </v-card>
        <v-pagination v-model="currentPage" :length="pageCount" />
    </div>

    <v-dialog v-model="showDelete" max-width="400">
        <v-card>
            <v-card-title>{{ $t('deleteComment') }}</v-card-title>
            <v-card-text>{{ commentToDelete.content }} ({{
                moment.utc(commentToDelete.created_at).tz(userTimeZone).format('YYYY-MM-DD HH:mm:ss') }})</v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red" @click="handleDeleteConfirm">{{ $t('confirm') }}</v-btn>
                <v-btn text @click="showDelete = false">{{ $t('cancel') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import moment from 'moment-timezone';

const props = defineProps({
    tweetId: Number()
});
const error = ref(null)
const comments = ref([])
const users = ref([])
const avatars = ref([])
const ready = ref(false)
const currentPage = ref(1)
const pageCount = ref(1)
const currentUserId = ref(null);
const replyBoxVisible = ref(null)
const replyContent = ref('')
const showDelete = ref(false)
const commentToDelete = ref(null)
const commentApi = ref('order_by_time')

const toggleApi = () => {
    if(commentApi.value == 'order_by_time') {
        commentApi.value = 'by_tweet'
    } else {
        commentApi.value = 'order_by_time'
    }
    updateComments();
}

const showReplyBox = (commentId) => {
    replyBoxVisible.value = commentId
    replyContent.value = ''
}

const handleDelete = async (commentId) => {
    try {
        await $fetch(`/api/comment/${commentId}`, {
            method: 'DELETE'
        });
        updateComments();
    } catch (err) {
        error.value = err.message || err;
    }
};

const getCurrentUser = async () => {
    try {
        const { user } = await $fetch('/api/auth/user');
        currentUserId.value = user.user_id;
    } catch (err) {
        error.value = err.message || err;
    }
};

const submitReply = async (parentCommentId) => {
    if (!replyContent.value.trim()) return
    try {
        await $fetch('/api/comment/reply', {
            method: 'POST',
            body: {
                tweet_id: props.tweetId,
                parent_id: parentCommentId,
                content: replyContent.value
            }
        })
        replyBoxVisible.value = null
        replyContent.value = ''
        updateComments()
    } catch (err) {
        error.value = err.message || err
    }
}

const updateComments = async () => {
    ready.value = false
    try {
        const data = await $fetch(`/api/comment/${commentApi.value}/${props['tweetId']}?page=${currentPage.value}`)
        if (!data.success) {
            throw createError(data.message)
        }

        pageCount.value = data.maxPages
        comments.value = data.data

        // 获取用户和头像
        const userPromises = comments.value.map(comment => $fetch(`/api/user/${comment.user_id}`))
        const avatarPromises = comments.value.map(comment => $fetch(`/api/avatar/${comment.user_id}`))
        const usersData = await Promise.all(userPromises)
        const avatarsData = await Promise.all(avatarPromises)
        users.value = usersData.map(userResponse => userResponse.user)
        avatars.value = avatarsData.map(avatarResponse => avatarResponse.data)

        // 获取二级评论
        for (const comment of comments.value) {
            const replyRes = await $fetch(`/api/comment/replies/${comment.comment_id}`)
            if (replyRes.success) {
                // 并发获取每个二级评论的用户和头像
                const replyUsers = await Promise.all(replyRes.data.map(r => $fetch(`/api/user/${r.user_id}`)))
                const replyAvatars = await Promise.all(replyRes.data.map(r => $fetch(`/api/avatar/${r.user_id}`)))
                comment.replies = replyRes.data.map((r, idx) => ({
                    ...r,
                    username: replyUsers[idx]?.user?.username || '',
                    avatar: replyAvatars[idx]?.data || ''
                }))
            } else {
                comment.replies = []
            }
        }

        ready.value = true
    } catch (err) {
        error.value = err.message || err
    }
}

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

watch(currentPage, updateComments)
onMounted(() => {
    getCurrentUser()
    updateComments()
})
defineExpose({ updateComments })

const handleDeleteConfirm = () => {
    if (commentToDelete.value) {
        handleDelete(commentToDelete.value.comment_id);
    }
    showDelete.value = false;
}

const showDeleteDialog = (comment) => {
    commentToDelete.value = comment;
    showDelete.value = true;
}
</script>

<style scoped>
.reply-list {
    margin-top: 8px;
}
</style>
