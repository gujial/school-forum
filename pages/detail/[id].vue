<template>
    <v-container>
        <v-row class="d-flex justify-center">
            <v-col>
                <v-alert v-if="error != null" type="error">
                    {{ error }}
                </v-alert>
                <v-alert v-if="suc != null" type="success">
                    {{ suc }}
                </v-alert>
                <v-card v-if="user != null" :prepend-avatar="avatar_url" :title="user.username" :subtitle="userTime">
                    <v-card-actions>
                        <v-btn flat :href="`mailto:${user.email}?subject=Re:${tweet.content}`">{{ $t('email') }}</v-btn>
                        <v-btn v-if="!follow_status" flat @click="followUser(user.user_id)">{{ $t('follow') }}</v-btn>
                        <v-btn v-else flat @click="unfolowUser(user.user_id)">{{ $t('unfollow') }}</v-btn>
                        <v-btn flat @click="navigateTo(localePath(`/profile/${user.user_id}`))">{{
                            $t('profile') }}</v-btn>
                        <v-btn v-if="currentUser && currentUser.user_id !== -1" flat @click="openTweetReportDialog(tweet.tweet_id)">{{ $t('report') }}</v-btn>
                        <v-btn
v-if="currentUser && (currentUser.user_id == user.user_id || currentUser.admin)" flat
                            color="error" @click="openDeleteDialog()">
                            {{ $t('delete') }}
                        </v-btn>
                    </v-card-actions>
                    <hr >
                    <v-card-text>
                        <TweetCard
v-if="parent_tweet_data" :tweet="parent_tweet_data" height="fit-content"
                            max-height="500px" />
                        <v-carousel v-if="images.length > 0" show-arrows="hover" progress hide-delimiters @click.stop>
                            <v-carousel-item v-for="image in images" :key="image.media_id" :src="image.media_url" />
                        </v-carousel>
                        <video
v-if="video != null" controls :src="video" width="100%" style="max-height: 70vh;"
                            @click.stop />
                    </v-card-text>
                    <v-card-text :id="`preview${tweet.tweet_id}`"/>
                    <hr >
                    <v-card-actions class="d-flex justify-end">
                        <v-btn icon @click.stop="likeTweet">
                            <v-icon v-if="isLike">
                                mdi-thumb-up
                            </v-icon>
                            <v-icon v-else>
                                mdi-thumb-up-outline
                            </v-icon>
                        </v-btn>
                        <span class="mr-4">{{ likeCount }}</span>
                        <v-icon small class="mr-1">mdi-comment-outline</v-icon>
                        <span>{{ commentCount }}</span>
                        <v-btn icon @click="navigateTo(localePath(`/edit?parent_id=${tweet.tweet_id}`))">
                            <v-icon>mdi-share</v-icon>
                        </v-btn>
                        <span>{{ shareCount }}</span>
                    </v-card-actions>
                    <div v-if="tweet.tags.length > 0" class="tag-list">
                        <v-chip
v-for="(tag, index) in tweet.tags" :key="index" class="ma-1" color="primary"
                            text-color="white" @click="navigateTo(localePath(`/tags?tags=${tag}`))">
                            {{ tag }}
                        </v-chip>
                    </div>
                    <CommentEditor
:tweet-id="$route.params.id" :receiver-id="tweet.user_id"
                        @comment-posted="fetchCounts" />
                </v-card>
                <v-alert v-else type="info">{{ $t('loading') }}</v-alert>
            </v-col>
        </v-row>
        <v-btn v-show="showScrollTop" icon="mdi-arrow-up" color="primary" class="scroll-top-btn" @click="scrollToTop" />
    </v-container>
    <v-dialog v-model="deleteDialog" max-width="400">
        <v-card>
            <v-card-title class="headline">{{ $t('confirmDelete') }}</v-card-title>
            <v-card-text>{{ $t('confirmDeleteMsg') || '确定要删除这条推文吗？' }}</v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="deleteDialog = false">{{ $t('cancel') }}</v-btn>
                <v-btn color="error" text @click="confirmDelete">{{ $t('delete') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-dialog v-model="reportDialog" max-width="400">
        <v-card>
            <v-card-title class="headline">{{ $t('confirmReport') }}</v-card-title>
            <v-card-text>{{ $t('confirmReportMsg') || '确定要举报这条推文吗？' }}</v-card-text>
            <v-text-field v-model="reportContent" :label="$t('reportContent')" :rules="[required]" />
            <v-card-actions>
                <v-spacer />
                <v-btn text @click="reportDialog = false">{{ $t('cancel') }}</v-btn>
                <v-btn color="error" text @click="confirmReport">{{ $t('report') }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import moment from 'moment-timezone';
import CommentEditor from '~/components/CommentEditor.vue';
import renderMarkdown from '~/util/renderMarkdown';
import TweetCard from '~/components/TweetCard.vue';
import 'vditor/dist/index.css';

const route = useRoute()
const user = ref(null)
const avatar_url = ref('/icon.png')
const error = ref(null)
const tweet = ref(null)
const images = ref([])
const video = ref(null)
const isLike = ref(false)
const likeCount = ref(0)
const commentCount = ref(0)
const shareCount = ref(0)
const localePath = useLocalePath();
const { t } = useI18n()
const parent_tweet_data = ref(null)
const follow_status = ref(false)
const showScrollTop = ref(false)
const currentUser = useAuthUser()
const deleteDialog = ref(false)
const reportDialog = ref(false)
const reportTweetId = ref(null)
const reportContent = ref('')
const suc = ref(null)

const openTweetReportDialog = (tweetId) => {
    reportDialog.value = true
    reportTweetId.value = tweetId
}

const confirmReport = async () => {
    try {
        if (!reportContent.value || reportContent.value === '') {
            throw t('contentRequired')
        }

        const res = await $fetch(`/api/report/tweet/${reportTweetId.value}`, {
            method: 'POST',
            body: JSON.stringify({
                content: reportContent.value
            })
        })

        if (!res.success) {
            throw res.message
        } else {
            suc.value = t('reportSuccess')
        }
    } catch (err) {
        error.value = err
    } finally {
        reportDialog.value = false
        reportContent.value = ''
        reportTweetId.value = null
    }
}

const handleScroll = () => {
    showScrollTop.value = window.scrollY > 300
}

const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
}

const openDeleteDialog = () => {
    deleteDialog.value = true
}

const deleteTweet = async (tweetId) => {
    try {
        const res = await $fetch(`/api/tweets/${tweetId}`, { method: 'DELETE' })
        if (res.success) {
            if (route.query.from && route.query.from !== '') {
                navigateTo(localePath(route.query.from));
            } else {
                navigateTo(localePath('/'));
            }
        } else {
            error.value = res.message || '删除失败'
        }
    } catch (err) {
        error.value = err
    }
}

const confirmDelete = async () => {
    if (tweet.value.tweet_id) {
        await deleteTweet(tweet.value.tweet_id)
    }
    deleteDialog.value = false
}

onMounted(() => {
    window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
})

const fetchFollowStatus = async () => {
    try {
        const res = await $fetch(`/api/follow/check/${user.value.user_id}`)
        follow_status.value = res.follow
    } catch (err) {
        if (err.statusCode === 401) {
            // 在评论区组件已经提示过了这里就不提示了
        } else {
            error.value = err
        }
    }
}

const followUser = async (id) => {
    try {
        const res = await $fetch(`/api/follow/${id}`)
        if (res.success) {
            follow_status.value = res.follow
        } else {
            error.value = t('cannotFollowYourself')
            setTimeout(() => { error.value = null }, 2000)
        }
    } catch (err) {
        error.value = err
    }
}

const unfolowUser = async (id) => {
    try {
        const res = await $fetch(`/api/follow/${id}`, { method: 'DELETE' })
        follow_status.value = res.follow
    } catch (err) {
        error.value = err
    }
}

const likeTweet = async () => {
    try {
        await $fetch(`/api/tweets/like/${tweet.value.tweet_id}`)
        updateLike()
        await fetchCounts()
    } catch (err) {
        if (err.statusCode == 401) {
            navigateTo(localePath('/login'))
        }
    }
};

const updateLike = async () => {
    try {
        const data = await $fetch(`/api/tweets/like/check/${tweet.value.tweet_id}`)
        isLike.value = data.like
    } catch (err) {
        console.log(err)
    }
}

const fetchCounts = async () => {
    try {
        const likeRes = await $fetch(`/api/tweets/like/count/${tweet.value.tweet_id}`)
        likeCount.value = likeRes.count || 0
        const commentRes = await $fetch(`/api/tweets/comment/count/${tweet.value.tweet_id}`)
        commentCount.value = commentRes.count || 0
        const shareRes = await $fetch(`/api/tweets/share/count/${tweet.value.tweet_id}`)
        shareCount.value = shareRes.count || 0
    } catch (e) {
        console.error('Error fetching counts:', e);
    }
}

try {
    const tweet_data = await $fetch(`/api/tweets/${route.params.id}`)
    tweet.value = tweet_data.data
    const user_data = await $fetch(`/api/user/${tweet.value.user_id}`)
    user.value = user_data.user
    const avatar_data = await $fetch(`/api/avatar/${tweet.value.user_id}`)
    avatar_url.value = avatar_data.data
    fetchFollowStatus()

    const media_data = await $fetch(`/api/media/${tweet.value.tweet_id}`)
    if (media_data.data.length > 0) {
        if (media_data.data[0].media_type == "video") {
            video.value = media_data.data[0].media_url
        } else {
            for (const data of media_data.data) {
                images.value.push(data)
            }
        }
    }

    if (tweet.value.parent_id) {
        const parent_data = await $fetch(`/api/tweets/${tweet.value.parent_id}`)
        if (parent_data.success) {
            parent_tweet_data.value = parent_data.data
        } else {
            parent_tweet_data.value = {
                tweet_id: tweet.value.parent_id,
                content: t('tweetNotFound'),
            }
        }
    }
} catch (err) {
    error.value = err
}

onMounted(async () => {
    updateLike()
    await fetchCounts()
    renderMarkdown(tweet.value.content, `preview${tweet.value.tweet_id}`);
})

watch(suc, () => {
    if (suc.value) {
        setTimeout(() => {
            suc.value = null
        }, 2000)
    }
})

watch(error, () => {
    if (error.value) {
        setTimeout(() => {
            error.value = null
        }, 2000)
    }
})

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const userTime = moment.utc(tweet.value.created_at).tz(userTimeZone).format('YYYY-MM-DD HH:mm:ss');
</script>
<style scoped>
.scroll-top-btn {
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 2000;
}
</style>