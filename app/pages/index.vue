<template>
    <v-container>
        <v-card :image="bgSrc" class="d-flex align-center head-card avatar-bg-mask" color="black">
            <div class="bg-mask" />
            <v-avatar v-if="src.length > 0" size="200">
                <v-img cover :src="src" />
            </v-avatar>
            <v-container>
                <v-card-title>{{ t('welcome') + ' ' + username }}</v-card-title>
                <v-card-text>{{ t('greeting') }}</v-card-text>
            </v-container>
            <v-card-actions>
                <v-btn text :to="localePath('/edit')">{{ t('newTweet') }}</v-btn>
            </v-card-actions>
        </v-card>
        <v-tabs v-model="tab" background-color="primary">
            <v-tab key="all">{{ t('all') }}</v-tab>
            <v-tab key="school">{{ t('school') }}</v-tab>
            <v-tab key="biaobai">{{ t('biaobai') }}</v-tab>
            <v-tab key="help">{{ t('help') }}</v-tab>
            <v-tab key="news">{{ t('news') }}</v-tab>
            <v-tab key="follow">{{ t('follow') }}</v-tab>
            <v-tab key="map">{{ t('map') }}</v-tab>
            <v-tab
                key="more"
                @click="
                    () => {
                        tab = 0;
                        navigateTo(localePath('/tags'));
                    }
                "
                >{{ t('more') }}</v-tab
            >
            <v-tab
                key="searchUser"
                @click="
                    () => {
                        tab = 0;
                        navigateTo(localePath('/search/user'));
                    }
                "
                >{{ t('searchUser') }}</v-tab
            >
            <v-tab
                key="searchTweet"
                @click="
                    () => {
                        tab = 0;
                        navigateTo(localePath('/search/tweet'));
                    }
                "
                >{{ t('searchTweet') }}</v-tab
            >
        </v-tabs>
        <v-row v-if="tweets != null">
            <v-alert v-if="tweets.length == 0 && tab != 6" type="info" style="margin: 20px">{{
                t('noTweets')
            }}</v-alert>
            <v-col v-for="tweet in tweets" v-else :key="tweet.tweet_id" cols="12" md="6" lg="4">
                <v-lazy>
                    <TweetCard :tweet="tweet" />
                </v-lazy>
            </v-col>
        </v-row>
        <v-alert v-else type="info">{{ t('loading') }}</v-alert>
        <v-row v-if="tab == 6">
            <iframe
                width="100%"
                height="700"
                src="https://www.openstreetmap.org/export/embed.html?bbox=115.7815223787844%2C28.650561869520143%2C115.80765782342552%2C28.668750457195618&amp;layer=mapnik"
                style="border: 1px solid black; margin: 20px"
            /><br /><small
                ><a href="https://www.openstreetmap.org/?#map=16/28.65966/115.79459"
                    >查看更大的地图</a
                ></small
            >
        </v-row>
        <v-pagination v-if="tab != 6" v-model="currentPage" :length="pageCount" />
        <v-alert v-if="authError">
            {{ t('pleaseLogin') }}
        </v-alert>
        <v-alert v-if="error != null" v-show="!authError" type="error">
            {{ error }}
        </v-alert>
    </v-container>
</template>

<script setup lang="ts">
    import TweetCard from '../components/TweetCard.vue';
    import { navigateTo } from '#app';
    import type {
        Tweet,
        AuthUser,
        TweetListApiResponse,
        BackgroundApiResponse,
    } from '../../types/models';

    const tweets = ref<Tweet[] | null>(null);
    const src = ref<string>('');
    const username = ref<string>('');
    const user_id = ref<number | null>(null);
    const localePath = useLocalePath();
    const currentPage = useState<number>('currentPage', () => 1);
    const pageCount = ref<number>(1);
    const error = ref<string | null>(null);
    const authError = ref<boolean>(false);
    const bgSrc = ref<string>('/card-image.jpg');
    const tab = ref<number>(0);
    const { t } = useI18n();

    const updateTweets = async () => {
        if (tab.value === 0) {
            const data = await $fetch<TweetListApiResponse>(
                `/api/tweets/order_by_time/${currentPage.value}`,
            );
            tweets.value = data.data;
            pageCount.value = data.maxPages;
        } else if (tab.value === 1) {
            const data = await $fetch<TweetListApiResponse>(
                `/api/tweets/by_tags_desc?tags=school&page=${currentPage.value}?pageSize=20`,
            );
            tweets.value = data.data;
            pageCount.value = data.maxPages;
        } else if (tab.value === 2) {
            const data = await $fetch<TweetListApiResponse>(
                `/api/tweets/by_tags_desc?tags=school,biaobai&page=${currentPage.value}?pageSize=20`,
            );
            tweets.value = data.data;
            pageCount.value = data.maxPages;
        } else if (tab.value === 3) {
            const data = await $fetch<TweetListApiResponse>(
                `/api/tweets/by_tags_desc?tags=school,help&page=${currentPage.value}?pageSize=20`,
            );
            tweets.value = data.data;
            pageCount.value = data.maxPages;
        } else if (tab.value === 4) {
            const data = await $fetch<TweetListApiResponse>(
                `/api/tweets/by_tags_desc?tags=school,news&page=${currentPage.value}?pageSize=20`,
            );
            tweets.value = data.data;
            pageCount.value = data.maxPages;
        } else if (tab.value === 5) {
            const data = await $fetch<TweetListApiResponse>(
                `/api/tweets/follow?&page=${currentPage.value}?pageSize=20`,
            );
            tweets.value = data.data;
            pageCount.value = data.maxPages;
        } else if (tab.value === 6) {
            tweets.value = [];
            pageCount.value = 1;
        }
    };

    const updateBg = async () => {
        try {
            const data = await $fetch<BackgroundApiResponse>('/api/bg/' + user_id.value);
            bgSrc.value = data.data || '/card-image.jpg';
        } catch {
            bgSrc.value = '/card-image.jpg';
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    watch(currentPage, () => {
        updateTweets();
        scrollToTop();
    });
    watch(tab, () => {
        currentPage.value = 1;
        updateTweets();
        scrollToTop();
    });

    onMounted(async () => {
        updateTweets();
        try {
            const data = await $fetch<{ success: boolean; user?: AuthUser }>('/api/auth/user');
            if (!data.user) {
                authError.value = true;
                return;
            }
            username.value = data.user.username;
            user_id.value = data.user.user_id;
            updateBg();
        } catch (err: unknown) {
            if (typeof err === 'object' && err !== null && ('status' in err || 'response' in err)) {
                const e = err as { status?: number; response?: { status?: number } };
                if (e.status === 401 || e.response?.status === 401) {
                    authError.value = true;
                } else {
                    error.value = String(err);
                }
            } else {
                error.value = String(err);
            }
        }
    });
</script>

<style scoped>
    .head-card {
        margin-bottom: 25px;
        position: relative;
        overflow: hidden;
        height: 300px;
    }

    .bg-mask {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.45);
        transition: background 0.3s;
        z-index: -1;
        pointer-events: none;
    }

    .avatar-bg-mask:hover .bg-mask {
        background: rgba(0, 0, 0, 0);
    }

    .v-avatar {
        z-index: 2;
    }
</style>
