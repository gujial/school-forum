<template>
    <v-alert v-if="error != null" type="error">
        {{ error }}
    </v-alert>
    <v-card-text v-if="comments.length == 0">{{ $t('noComments') }}</v-card-text>
    <div v-else-if="ready">
        <v-card
            v-for="(comment, index) in comments" :key="comment.comment_id" :prepend-avatar="avatars[index]"
            :title="users[index].username"
            :subtitle="moment.utc(comment.created_at).tz(userTimeZone).format('YYYY-MM-DD HH:mm:ss')" :variant="'flat'">
            <template #append>
                <v-card-actions>
                    <v-btn :href="`mailto:${users[index].email}?subject=Re:${comment.content}`">{{ $t('email') }}</v-btn>
                    <v-btn>{{ $t('profile') }}</v-btn>
                    <v-btn @click="showReplyBox(comment.comment_id)">{{ $t('reply') }}</v-btn>
                </v-card-actions>
            </template>
            <v-card-text>
                {{ comment.content }}
                <!-- 二级评论展示 -->
                <div v-if="comment.replies && comment.replies.length > 0" class="reply-list">
                    <v-card
                        v-for="reply in comment.replies"
                        :key="reply.comment_id"
                        class="ml-6 mb-2"
                        variant="outlined"
                        density="compact"
                    >
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
                    </v-card>
                </div>
                <!-- 回复输入框 -->
                <div v-if="replyBoxVisible === comment.comment_id" class="mt-2">
                    <v-textarea v-model="replyContent" :label="$t('replyContent')" auto-grow />
                    <v-btn size="small" @click="submitReply(comment.comment_id)">{{ $t('submit') }}</v-btn>
                    <v-btn size="small" @click="replyBoxVisible = null">{{ $t('cancel') }}</v-btn>
                </div>
            </v-card-text>
        </v-card>
        <v-pagination v-model="currentPage" :length="pageCount"/>
    </div>
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

const replyBoxVisible = ref(null)
const replyContent = ref('')

const showReplyBox = (commentId) => {
    replyBoxVisible.value = commentId
    replyContent.value = ''
}

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
        const data = await $fetch(`/api/comment/order_by_time/${props['tweetId']}?page=${currentPage.value}`)
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
onMounted(updateComments)
defineExpose({ updateComments })
</script>

<style scoped>
.reply-list {
    margin-top: 8px;
}
</style>
