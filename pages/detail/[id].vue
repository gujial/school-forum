<template>
    <v-container>
        <v-row class="d-flex justify-center">
            <v-col>
                <v-alert v-if="error != null" type="error">
                    {{ error }}
                </v-alert>
                <v-card v-if="user != null" :prepend-avatar="avatar_url" :title="user.username" :subtitle="userTime">
                    <v-card-actions>
                        <v-btn :href="`mailto:${user.email}?subject=Re:${tweet.content}`">{{ $t('email') }}</v-btn>
                        <v-btn :href="`mailto:${user.email}?subject=Re:${tweet.content}`">{{ $t('follow') }}</v-btn>
                        <v-btn @click="navigateTo(`/profile/${user.user_id}`)">{{ $t('profile') }}</v-btn>
                    </v-card-actions>
                    <hr>
                    </hr>
                    <v-card-text>
                        <div :id="`preview${tweet.tweet_id}`" />
                    </v-card-text>
                    <v-card-text>
                        <v-carousel v-if="images.length > 0" show-arrows="hover" progress hide-delimiters @click.stop>
                            <v-carousel-item v-for="image in images" :key="image.media_id" :src="image.media_url" />
                        </v-carousel>
                        <video v-if="video != null" controls :src="video" width="100%" style="max-height: 70vh;"
                            @click.stop />
                    </v-card-text>
                    <hr>
                    </hr>
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
                    </v-card-actions>
                    <CommentEditor :tweet-id="$route.params.id" @comment-posted="fetchCounts" />
                </v-card>
                <v-alert v-else type="info">{{ $t('loading') }}</v-alert>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import moment from 'moment-timezone';
import CommentEditor from '~/components/CommentEditor.vue';
import renderMarkdown from '~/util/renderMarkdown';
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
const localePath = useLocalePath();

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
} catch (err) {
    error.value = err
}

onMounted(async () => {
    updateLike()
    await fetchCounts()
    renderMarkdown(tweet.value.content, `preview${tweet.value.tweet_id}`);
})

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const userTime = moment.utc(tweet.value.created_at).tz(userTimeZone).format('YYYY-MM-DD HH:mm:ss');
</script>