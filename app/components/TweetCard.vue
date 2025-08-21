<template>
    <v-card
        v-if="user != null"
        class="mb-3"
        :prepend-avatar="avatar_url"
        :title="user.username"
        :subtitle="userTime"
        style="display: flex; flex-direction: column"
        :height="props.height || '500px'"
        :max-height="props.maxHeight || '500px'"
        @click="goToDetail"
    >
        <v-divider />
        <v-alert v-if="error != null" type="error">
            {{ error }}
        </v-alert>
        <v-card-text v-if="tweet.parent_tweet" class="retweet">
            <p>{{ tweet.parent_tweet.content }}</p>
        </v-card-text>
        <v-card-text
            :id="`preview${tweet.tweet_id}`"
            :class="{ 'text-content': !hasMedia, content: hasMedia, 'no-interaction': true }"
        >
            <MarkdownPreview :md="tweet.content" />
        </v-card-text>
        <v-carousel
            v-if="images.length > 0"
            height="300px"
            cycle
            :show-arrows="false"
            hide-delimiters
        >
            <v-carousel-item
                v-for="image in images"
                :key="image.media_id"
                :src="image.media_url"
                cover
            />
        </v-carousel>
        <video v-if="video != null" :src="video" height="300px" muted autoplay loop />
        <v-card-text v-if="tweet.tags.length > 0" style="flex: none">
            <div class="tag-list-wrapper">
                <div class="tag-list">
                    <v-chip
                        v-for="(tag, index) in tweet.tags"
                        :key="index"
                        class="ma-1"
                        color="primary"
                        text-color="white"
                    >
                        {{ tag }}
                    </v-chip>
                </div>
            </div>
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
            <v-btn icon @click.stop="likeTweet">
                <v-icon v-if="isLike"> mdi-thumb-up </v-icon>
                <v-icon v-else> mdi-thumb-up-outline </v-icon>
            </v-btn>
            <span class="mr-4">{{ likeCount }}</span>
            <v-icon small class="mr-1">mdi-comment-outline</v-icon>
            <span>{{ commentCount }}</span>
            <v-btn icon @click.stop="navigateTo(localePath(`/edit?parent_id=${tweet.tweet_id}`))">
                <v-icon>mdi-share</v-icon>
            </v-btn>
            <span>{{ shareCount }}</span>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
    import moment from 'moment-timezone';
    import MarkdownPreview from './MarkdownPreview.vue';
    import { navigateTo } from '#app';
    import type {
        Tweet,
        User,
        Media,
        LikeCountResponse,
        CommentCountResponse,
        ShareCountResponse,
        UserApiResponse,
        AvatarApiResponse,
        MediaApiResponse,
        TweetApiResponse,
    } from '../../types/models';

    const isLike = ref(false);
    const localePath = useLocalePath();

    const props = defineProps<{
        tweet: Tweet;
        height?: string;
        maxHeight?: string;
    }>();

    const { tweet } = toRefs(props);
    const router = useRouter();

    const user = ref<User | null>(null);
    const avatar_url = ref<string>('/icon.png');
    const error = ref<string | null>(null);
    const images = ref<Media[]>([]);
    const video = ref<string | null>(null);
    const likeCount = ref(0);
    const commentCount = ref(0);
    const shareCount = ref(0);
    const userTime = ref('');
    const { t } = useI18n();
    const route = useRoute();

    const goToDetail = () => {
        router.push(localePath(`/detail/${tweet.value.tweet_id}?from=${route.path}`));
    };

    const likeTweet = async () => {
        try {
            await $fetch(`/api/tweets/like/${tweet.value.tweet_id}`);
            updateLike();
            await fetchCounts();
        } catch (err: unknown) {
            if ((err as { statusCode?: number })?.statusCode === 401) {
                navigateTo(localePath('/login'));
            }
        }
    };

    const updateLike = async () => {
        try {
            const data = await $fetch<{ success: boolean; like: boolean }>(
                `/api/tweets/like/check/${tweet.value.tweet_id}`,
            );
            isLike.value = data.like;
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCounts = async () => {
        try {
            const likeRes = await $fetch<LikeCountResponse>(
                `/api/tweets/like/count/${tweet.value.tweet_id}`,
            );
            likeCount.value = likeRes.count || 0;
            const commentRes = await $fetch<CommentCountResponse>(
                `/api/tweets/comment/count/${tweet.value.tweet_id}`,
            );
            commentCount.value = commentRes.count || 0;
            const shareRes = await $fetch<ShareCountResponse>(
                `/api/tweets/share/count/${tweet.value.tweet_id}`,
            );
            shareCount.value = shareRes.count || 0;
        } catch (e) {
            console.error('Error fetching counts:', e);
        }
    };

    onMounted(async () => {
        try {
            const user_data = await $fetch<UserApiResponse>(`/api/user/${tweet.value.user_id}`);
            if (!user_data.user) {
                user.value = {
                    username: t('unknownUser'),
                    user_id: tweet.value.user_id,
                } as User;
            } else {
                user.value = user_data.user;
            }
            const avatar_data = await $fetch<AvatarApiResponse>(
                `/api/avatar/${user.value?.user_id}`,
            );
            if (!avatar_data.data) {
                avatar_url.value = '/icon.png';
                return;
            }
            avatar_url.value = avatar_data.data;

            const media_data = await $fetch<MediaApiResponse>(`/api/media/${tweet.value.tweet_id}`);
            if (media_data.data && media_data.data.length > 0) {
                if (media_data.data[0]?.media_type == 'video') {
                    video.value = media_data.data[0].media_url;
                } else {
                    for (const data of media_data.data) {
                        images.value.push(data as Media);
                    }
                }
            }

            if (tweet.value.parent_id) {
                const parent_data = await $fetch<TweetApiResponse>(
                    `/api/tweets/${tweet.value.parent_id}`,
                );
                if (parent_data.success && parent_data.data) {
                    tweet.value.parent_tweet = parent_data.data as Tweet;
                } else {
                    tweet.value.parent_tweet = {
                        tweet_id: tweet.value.parent_id,
                        content: t('tweetNotFound'),
                    } as Tweet;
                }
            }
        } catch (err: unknown) {
            error.value = String(err);
        }
        updateLike();
        await fetchCounts();
    });

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tweet.value.created_at) {
        userTime.value = moment
            .utc(tweet.value.created_at)
            .tz(userTimeZone)
            .format('YYYY-MM-DD HH:mm:ss');
    } else {
        userTime.value = t('unknownTime');
    }

    const hasMedia = computed(() => images.value.length > 0 || video.value != null);
</script>

<style scoped>
    .mb-3 {
        margin-bottom: 16px;
    }

    .content {
        white-space: nowrap;
        overflow: hidden;
        /* 隐藏溢出内容 */
        text-overflow: ellipsis;
        /* 添加省略号 */
    }

    ::v-deep(.vditor-reset p) {
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .text-content {
        overflow-y: hidden;
        max-height: 80%;
    }

    .retweet {
        margin: 5px;
        height: fit-content;
        flex: none;
    }

    .retweet p {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-style: italic;
        color: #848484;
    }

    .tag-list-wrapper {
        position: relative;
        overflow: hidden;
        white-space: nowrap;
    }

    .tag-list {
        display: inline-flex;
        flex-wrap: nowrap;
        align-items: center;
    }

    .no-interaction {
        pointer-events: none;
        user-select: none;
    }
</style>
