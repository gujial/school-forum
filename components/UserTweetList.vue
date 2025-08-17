<template>
  <div>
    <h2 style="margin-bottom: 20px;">{{ $t('userTweets') }}</h2>
    <v-row>
      <v-col v-for="tweet in tweets" :key="tweet.tweet_id" cols="12" md="6" lg="4">
        <v-lazy>
          <TweetCard :tweet="tweet" />
        </v-lazy>
      </v-col>
      <v-alert v-if="tweets.length === 0" type="info">{{ $t('noTweets') }}</v-alert>
    </v-row>
    <v-alert v-if="error" type="error">{{ error }}</v-alert>
    <v-pagination v-if="pageCount > 1" v-model="currentPage" :length="pageCount" class="my-4" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import TweetCard from '~/components/TweetCard.vue'

const props = defineProps({
  userId: {
    type: [String, Number],
    required: true
  }
})

const tweets = ref([])
const error = ref(null)
const currentPage = ref(1)
const pageCount = ref(1)
const pageSize = 9

const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
}

const fetchTweets = async () => {
  try {
    const res = await $fetch(`/api/tweets/user/${props.userId}?page=${currentPage.value}&pageSize=${pageSize}`)
    tweets.value = res.data || []
    pageCount.value = res.maxPages || 1
    error.value = null
  } catch (err) {
    error.value = err.message || err
    tweets.value = []
  }
}

watch(currentPage, () => {
  fetchTweets()
  scrollToTop()
})
onMounted(fetchTweets)
</script>