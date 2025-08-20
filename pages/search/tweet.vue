<template>
  <v-container>
    <v-row class="my-4" justify="space-between">
      <!-- 输入关键词 -->
      <v-text-field
        v-model="keyword"
        :label="$t('enterKeyword')"
        clearable
        class="mr-4"
        @keyup.enter="applyFilter"
      />

      <!-- 排序按钮 -->
      <v-btn-toggle v-model="order" mandatory>
        <v-btn value="asc" flat :title="$t('ascending')">
          <v-icon>mdi-arrow-up</v-icon>
        </v-btn>
        <v-btn value="desc" flat :title="$t('descending')">
          <v-icon>mdi-arrow-down</v-icon>
        </v-btn>
      </v-btn-toggle>

      <v-btn flat @click="applyFilter">🔍 {{ $t('search') }}</v-btn>
    </v-row>

    <!-- 推文结果 -->
    <v-row v-if="tweets.length > 0">
      <v-col
        v-for="tweet in tweets"
        :key="tweet.tweet_id"
        cols="12"
        md="6"
        lg="4"
      >
        <TweetCard :tweet="tweet" />
      </v-col>
    </v-row>

    <v-alert v-else-if="!loading && !error && loaded" type="info">
      {{ $t('noTweets') }}
    </v-alert>
    <v-alert v-else-if="loading && !error" type="info">
      {{ $t('loading') }}
    </v-alert>
    <v-alert v-if="error" type="error">
      {{ error }}
    </v-alert>

    <!-- 分页 -->
    <v-pagination
      v-if="maxPages > 1"
      v-model="currentPage"
      :length="maxPages"
      class="my-4"
    />
  </v-container>
</template>

<script setup>
import TweetCard from '~/components/TweetCard.vue'

const keyword = ref('')
const order = ref('desc')
const tweets = ref([])
const currentPage = ref(1)
const maxPages = ref(1)
const loading = ref(false)
const loaded = ref(false)
const error = ref(null)

async function fetchTweets() {
  if (!keyword.value.trim()) {
    tweets.value = []
    maxPages.value = 1
    loaded.value = true
    return
  }

  loading.value = true
  error.value = null
  try {
    const url = `/api/tweets/search?keyword=${encodeURIComponent(
      keyword.value
    )}&page=${currentPage.value}&pageSize=20&order=${order.value}`

    const res = await $fetch(url)
    if (res.success) {
      tweets.value = res.data
      maxPages.value = res.maxPages
      loaded.value = true
    } else {
      error.value = res.message || 'Failed to fetch tweets'
      tweets.value = []
      maxPages.value = 1
    }
  } catch (e) {
    error.value = 'Request failed'
    tweets.value = []
    maxPages.value = 1
  } finally {
    loading.value = false
  }
}

function applyFilter() {
  if (keyword.value.trim()) {
    currentPage.value = 1
    fetchTweets()
  } else {
    error.value = $t('pleaseEnterKeyword')
  }
}

watch(currentPage, fetchTweets)
watch(order, fetchTweets)

const route = useRoute()

onMounted(() => {
  const queryKeyword = route.query.keyword
  if (queryKeyword && typeof queryKeyword === 'string' && queryKeyword.trim()) {
    keyword.value = queryKeyword
    applyFilter()
  }
})
</script>
