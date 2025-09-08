<template>
    <v-container>
        <v-row class="my-4" justify="space-between">
            <v-text-field
                v-model="tagInput"
                label="输入标签 (逗号分隔)"
                placeholder="例如: tech,ai,news"
                clearable
                class="mr-4"
                @keyup.enter="applyFilter"
            />
            <v-btn-toggle v-model="order" mandatory>
                <v-btn value="asc" flat :title="t('ascending')">
                    <v-icon>mdi-arrow-up</v-icon>
                </v-btn>
                <v-btn value="desc" flat :title="t('descending')">
                    <v-icon>mdi-arrow-down</v-icon>
                </v-btn>
            </v-btn-toggle>
            <v-btn flat @click="applyFilter">🔍{{ t('filter') }}</v-btn>
        </v-row>

        <v-row v-if="tweets.length > 0">
            <v-col v-for="tweet in tweets" :key="tweet.tweet_id" cols="12" md="6" lg="4">
                <TweetCard :tweet="tweet" />
            </v-col>
        </v-row>
        <v-alert v-else-if="loaded && !loading && !error" type="info">{{ t('noTweets') }}</v-alert>
        <v-alert v-else-if="loaded && !error" type="info">{{ t('loading') }}</v-alert>
        <v-alert v-if="error != null" type="error">
            {{ error }}
        </v-alert>

        <v-pagination v-model="currentPage" :length="maxPages" class="my-4" @input="fetchTweets" />
    </v-container>
</template>

<script setup lang="ts">
    import TweetCard from '../components/TweetCard.vue';
    import type { Tweet } from '../../types/models';

    const tagInput = ref<string>('');
    const order = ref<string>('desc');
    const tweets = ref<Tweet[]>([]);
    const currentPage = ref<number>(1);
    const maxPages = ref<number>(1);
    const loading = ref<boolean>(false);
    const loaded = ref<boolean>(false);
    const error = ref<string | null>(null);
    const { t } = useI18n();

    async function fetchTweets() {
        if (!tagInput.value.trim()) {
            tweets.value = [];
            maxPages.value = 1;
            return;
        }
        loading.value = true;
        try {
            const tagStr = tagInput.value.trim();
            const sort = order.value;

            const url =
                sort === 'asc'
                    ? `/api/tweets/by_tags_asc?tags=${encodeURIComponent(tagStr)}&page=${currentPage.value}&pageSize=20`
                    : `/api/tweets/by_tags_desc?tags=${encodeURIComponent(tagStr)}&page=${currentPage.value}&pageSize=20`;

            const res = await $fetch<{
                success: boolean;
                data?: Tweet[];
                maxPages?: number;
                message?: string;
            }>(url);
            if (res.success) {
                tweets.value = res.data || [];
                maxPages.value = res.maxPages || 1;
                loaded.value = true;
            } else {
                error.value = res.message || 'Failed to fetch tweets';
                tweets.value = [];
                maxPages.value = 1;
            }
        } catch (e: unknown) {
            tweets.value = [];
            maxPages.value = 1;
            console.error(e);
        } finally {
            loading.value = false;
        }
    }

    function applyFilter() {
        if (tagInput.value.trim()) {
            error.value = null;
            currentPage.value = 1;
            loaded.value = true;
            fetchTweets();
        } else {
            error.value = '请输入标签';
        }
    }

    watch(currentPage, fetchTweets);
    watch(order, fetchTweets);

    const route = useRoute();

    onMounted(() => {
        const queryTags = route.query.tags;
        if (queryTags && typeof queryTags === 'string' && queryTags.trim()) {
            tagInput.value = queryTags;
            applyFilter();
        }
    });
</script>
