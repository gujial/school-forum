<template>
    <div>
        <v-container>
            <v-row class="d-flex justify-center">
                <v-col>
                    <v-alert v-if="error != null" type="error">
                        {{ error }}
                    </v-alert>
                    <v-alert v-if="suc != null" type="success">
                        {{ suc }}
                    </v-alert>
                    <v-card
                        v-if="user != null && tweet != null"
                        :prepend-avatar="avatar_url"
                        :title="user.username"
                        :subtitle="userTime"
                    >
                        <v-card-actions>
                            <v-btn
                                flat
                                :href="`mailto:${user.email}?subject=Re:${tweet.content}`"
                                >{{ t('email') }}</v-btn
                            >
                            <v-btn v-if="!follow_status" flat @click="followUser(user.user_id)">{{
                                t('follow')
                            }}</v-btn>
                            <v-btn v-else flat @click="unfolowUser(user.user_id)">{{
                                t('unfollow')
                            }}</v-btn>
                            <v-btn
                                flat
                                @click="navigateTo(localePath(`/profile/${user.user_id}`))"
                                >{{ t('profile') }}</v-btn
                            >
                            <v-btn
                                v-if="currentUser && currentUser.user_id !== -1"
                                flat
                                @click="openTweetReportDialog(tweet.tweet_id)"
                                >{{ t('report') }}</v-btn
                            >
                            <v-btn
                                v-if="
                                    currentUser &&
                                    (currentUser.user_id == user.user_id || currentUser.admin)
                                "
                                flat
                                color="error"
                                @click="openDeleteDialog()"
                            >
                                {{ t('delete') }}
                            </v-btn>
                        </v-card-actions>
                        <hr />
                        <v-card-text>
                            <TweetCard
                                v-if="parent_tweet_data"
                                :tweet="parent_tweet_data"
                                height="fit-content"
                                max-height="500px"
                            />
                            <v-carousel
                                v-if="images.length > 0"
                                show-arrows="hover"
                                progress
                                hide-delimiters
                                @click.stop
                            >
                                <v-carousel-item
                                    v-for="image in images"
                                    :key="image.media_id"
                                    :src="image.media_url"
                                />
                            </v-carousel>
                            <video
                                v-if="video != null"
                                controls
                                :src="video"
                                width="100%"
                                style="max-height: 70vh"
                                @click.stop
                            />
                        </v-card-text>
                        <v-card-text>
                            <Markdown :id="`preview${tweet.tweet_id}`" :md="tweet.content" />
                        </v-card-text>
                        <hr />
                        <v-card-actions class="d-flex justify-end">
                            <v-btn icon @click.stop="likeTweet">
                                <v-icon v-if="isLike"> mdi-thumb-up </v-icon>
                                <v-icon v-else> mdi-thumb-up-outline </v-icon>
                            </v-btn>
                            <span class="mr-4">{{ likeCount }}</span>
                            <v-icon small class="mr-1">mdi-comment-outline</v-icon>
                            <span>{{ commentCount }}</span>
                            <v-btn
                                icon
                                @click="navigateTo(localePath(`/edit?parent_id=${tweet.tweet_id}`))"
                            >
                                <v-icon>mdi-share</v-icon>
                            </v-btn>
                            <span>{{ shareCount }}</span>
                        </v-card-actions>
                        <div v-if="tweet.tags.length > 0" class="tag-list">
                            <v-chip
                                v-for="(tag, index) in tweet.tags"
                                :key="index"
                                class="ma-1"
                                color="primary"
                                text-color="white"
                                @click="navigateTo(localePath(`/tags?tags=${tag}`))"
                            >
                                {{ tag }}
                            </v-chip>
                        </div>
                        <CommentEditor
                            :tweet-id="Number(route.params.id)"
                            :receiver-id="tweet.user_id"
                            @comment-posted="fetchCounts"
                        />
                    </v-card>
                    <v-alert v-else type="info">{{ t('loading') }}</v-alert>
                </v-col>
            </v-row>
            <v-btn
                v-show="showScrollTop"
                icon="mdi-arrow-up"
                color="primary"
                class="scroll-top-btn"
                @click="scrollToTop"
            />
        </v-container>
        <v-dialog v-model="deleteDialog" max-width="400">
            <v-card>
                <v-card-title class="headline">{{ t('confirmDelete') }}</v-card-title>
                <v-card-text>{{ t('confirmDeleteMsg') || '确定要删除这条推文吗？' }}</v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="deleteDialog = false">{{ t('cancel') }}</v-btn>
                    <v-btn color="error" text @click="confirmDelete">{{ t('delete') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog v-model="reportDialog" max-width="400">
            <v-card>
                <v-card-title class="headline">{{ t('confirmReport') }}</v-card-title>
                <v-card-text>{{ t('confirmReportMsg') || '确定要举报这条推文吗？' }}</v-card-text>
                <v-text-field
                    v-model="reportContent"
                    :label="t('reportContent')"
                    :rules="[(v: string) => !!v || t('fieldIsRequired')]"
                />
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="reportDialog = false">{{ t('cancel') }}</v-btn>
                    <v-btn color="error" text @click="confirmReport">{{ t('report') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
    import moment from 'moment-timezone';
    import CommentEditor from '../../components/CommentEditor.vue';
    import Markdown from '../../components/Markdown.vue';
    import TweetCard from '../../components/TweetCard.vue';
    import type { User, Tweet, Media } from '../../../types/models';
    import { navigateTo } from '#app';

    const route = useRoute();
    const user = ref<User | null>(null);
    const avatar_url = ref<string>('/icon.png');
    const error = ref<string | null>(null);
    const tweet = ref<Tweet | null>(null);
    const images = ref<Media[]>([]);
    const video = ref<string | null>(null);
    const isLike = ref<boolean>(false);
    const likeCount = ref<number>(0);
    const commentCount = ref<number>(0);
    const shareCount = ref<number>(0);
    const localePath = useLocalePath();
    const { t } = useI18n();
    const parent_tweet_data = ref<Tweet | null>(null);
    const follow_status = ref<boolean>(false);
    const showScrollTop = ref<boolean>(false);
    const currentUser = useAuthUser();
    const deleteDialog = ref<boolean>(false);
    const reportDialog = ref<boolean>(false);
    const reportTweetId = ref<number | null>(null);
    const reportContent = ref<string>('');
    const suc = ref<string | null>(null);

    const openTweetReportDialog = (tweetId: number) => {
        reportDialog.value = true;
        reportTweetId.value = tweetId;
    };

    const confirmReport = async () => {
        try {
            if (!reportContent.value || reportContent.value === '') {
                throw t('contentRequired');
            }

            const res = await $fetch(`/api/report/tweet/${reportTweetId.value}`, {
                method: 'POST',
                body: JSON.stringify({
                    content: reportContent.value,
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
            reportTweetId.value = null;
        }
    };

    const handleScroll = () => {
        showScrollTop.value = window.scrollY > 300;
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const openDeleteDialog = () => {
        deleteDialog.value = true;
    };

    const deleteTweet = async (tweetId: number) => {
        try {
            const res = await $fetch<{ success: boolean; message?: string }>(
                `/api/tweets/${tweetId}`,
                { method: 'DELETE' },
            );
            if (res.success) {
                if (route.query.from && route.query.from !== '') {
                    navigateTo(localePath(route.query.from as string));
                } else {
                    navigateTo(localePath('/'));
                }
            } else {
                error.value = res.message || '删除失败';
            }
        } catch (err: unknown) {
            error.value = String(err);
        }
    };

    const confirmDelete = async () => {
        if (tweet.value?.tweet_id) {
            await deleteTweet(tweet.value.tweet_id);
        }
        deleteDialog.value = false;
    };

    onMounted(() => {
        window.addEventListener('scroll', handleScroll);
    });

    onBeforeUnmount(() => {
        window.removeEventListener('scroll', handleScroll);
    });

    const fetchFollowStatus = async () => {
        if (!user.value) return;
        try {
            const res = await $fetch<{ success: boolean; follow?: boolean }>(
                `/api/follow/check/${user.value.user_id}`,
            );
            follow_status.value = res.follow || false;
        } catch (err: unknown) {
            const statusCode = (err as { statusCode?: number })?.statusCode;

            if (statusCode === 401) {
                // 在评论区组件已经提示过了这里就不提示了
            } else {
                error.value = String(err);
            }
        }
    };

    const followUser = async (id: number) => {
        try {
            const res = await $fetch<{ success: boolean; follow?: boolean }>(`/api/follow/${id}`);
            if (res.success) {
                follow_status.value = res.follow || false;
            } else {
                error.value = t('cannotFollowYourself');
                setTimeout(() => {
                    error.value = null;
                }, 2000);
            }
        } catch (err: unknown) {
            error.value = String(err);
        }
    };

    const unfolowUser = async (id: number) => {
        try {
            const res = await $fetch<{ success: boolean; follow?: boolean }>(`/api/follow/${id}`, {
                method: 'DELETE',
            });
            follow_status.value = res.follow || false;
        } catch (err: unknown) {
            error.value = String(err);
        }
    };

    const likeTweet = async () => {
        if (!tweet.value) return;
        try {
            await $fetch(`/api/tweets/like/${tweet.value.tweet_id}`);
            updateLike();
            await fetchCounts();
        } catch (err: unknown) {
            const statusCode = (err as { statusCode?: number })?.statusCode;
            if (statusCode === 401) {
                navigateTo(localePath('/login'));
            }
        }
    };

    const updateLike = async () => {
        if (!tweet.value) return;
        try {
            const data = await $fetch<{ success: boolean; like?: boolean }>(
                `/api/tweets/like/check/${tweet.value.tweet_id}`,
            );
            isLike.value = data.like || false;
        } catch (err: unknown) {
            console.error(err);
        }
    };

    const fetchCounts = async () => {
        if (!tweet.value) return;
        try {
            const likeRes = await $fetch<{ success: boolean; count?: number }>(
                `/api/tweets/like/count/${tweet.value.tweet_id}`,
            );
            likeCount.value = likeRes.count || 0;
            const commentRes = await $fetch<{ success: boolean; count?: number }>(
                `/api/tweets/comment/count/${tweet.value.tweet_id}`,
            );
            commentCount.value = commentRes.count || 0;
            const shareRes = await $fetch<{ success: boolean; count?: number }>(
                `/api/tweets/share/count/${tweet.value.tweet_id}`,
            );
            shareCount.value = shareRes.count || 0;
        } catch (e: unknown) {
            console.error('Error fetching counts:', e);
        }
    };

    try {
        const tweet_data = await $fetch<{ success: boolean; data?: Tweet }>(
            `/api/tweets/${route.params.id}`,
        );
        tweet.value = tweet_data.data || null;

        if (tweet.value) {
            const user_data = await $fetch<{ success: boolean; user?: User }>(
                `/api/user/${tweet.value.user_id}`,
            );
            user.value = user_data.user || null;
            const avatar_data = await $fetch<{ success: boolean; data?: string }>(
                `/api/avatar/${tweet.value.user_id}`,
            );
            avatar_url.value = avatar_data.data || '/icon.png';
            fetchFollowStatus();

            const media_data = await $fetch<{ success: boolean; data?: Media[] }>(
                `/api/media/${tweet.value.tweet_id}`,
            );
            if (media_data.data && media_data.data.length > 0) {
                if (media_data.data[0]?.media_type == 'video') {
                    video.value = media_data.data[0].media_url;
                } else {
                    for (const data of media_data.data) {
                        images.value.push(data);
                    }
                }
            }

            if (tweet.value.parent_id) {
                const parent_data = await $fetch<{ success: boolean; data?: Tweet }>(
                    `/api/tweets/${tweet.value.parent_id}`,
                );
                if (parent_data.success && parent_data.data) {
                    parent_tweet_data.value = parent_data.data;
                } else {
                    parent_tweet_data.value = {
                        tweet_id: tweet.value.parent_id,
                        user_id: 0,
                        content: t('tweetNotFound'),
                        tags: [],
                    };
                }
            }
        }
    } catch (err: unknown) {
        error.value = String(err);
    }

    onMounted(async () => {
        updateLike();
        await fetchCounts();
    });

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

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const userTime = tweet.value
        ? moment.utc(tweet.value.created_at).tz(userTimeZone).format('YYYY-MM-DD HH:mm:ss')
        : '';
</script>
<style scoped>
    .scroll-top-btn {
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 2000;
    }
</style>
