<template>
    <div>
        <h2 style="margin-bottom: 20px">{{ t('userTweets') }}</h2>
        <v-row>
            <v-col v-for="tweet in tweets" :key="tweet.tweet_id" cols="12" md="6" lg="4">
                <v-lazy>
                    <TweetCard :tweet="tweet" />
                </v-lazy>
            </v-col>
            <v-alert v-if="tweets.length === 0" type="info">{{ t('noTweets') }}</v-alert>
        </v-row>
        <v-alert v-if="error" type="error">{{ error }}</v-alert>
        <v-pagination v-if="pageCount > 1" v-model="currentPage" :length="pageCount" class="my-4" />
    </div>
</template>

<script setup lang="ts">
    import { ref, watch, onMounted } from 'vue';
    import TweetCard from './TweetCard.vue';
    import type { Tweet } from '../../types/models';

    const props = defineProps<{
        userId: string | number;
    }>();

    const tweets = ref<Tweet[]>([]);
    const error = ref<string | null>(null);
    const currentPage = ref<number>(1);
    const pageCount = ref<number>(1);
    const pageSize = 9;
    const { t } = useI18n();

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const fetchTweets = async () => {
        try {
            const res = await $fetch<{ success: boolean; data?: Tweet[]; maxPages?: number }>(
                `/api/tweets/user/${props.userId}?page=${currentPage.value}&pageSize=${pageSize}`,
            );
            tweets.value = res.data || [];
            pageCount.value = res.maxPages || 1;
            error.value = null;
        } catch (err: unknown) {
            error.value = String(err);
            tweets.value = [];
        }
    };

    watch(currentPage, () => {
        fetchTweets();
        scrollToTop();
    });
    onMounted(fetchTweets);
</script>
