<template>
  <div>
    <h2>{{ $t('userTweets') }}</h2>
    <v-row>
      <v-col v-for="tweet in tweets" :key="tweet.tweet_id" cols="12" md="6" lg="4">
        <TweetCard :tweet="tweet" />
      </v-col>
    </v-row>
    <v-pagination
      v-if="pageCount > 1"
      v-model="currentPage"
      :length="pageCount"
      class="my-4"
    />
    <v-alert v-if="tweets.length === 0" type="info">{{ $t('noTweets') }}</v-alert>
    <v-alert v-if="error" type="error">{{ error }}</v-alert>
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

const fetchTweets = async () => {
  try {
    const res = await $fetch(`/api/tweets/user/${props.userId}?page=${currentPage.value}?pageSize=9`)
    tweets.value = res.data || []
    pageCount.value = res.maxPages || 1
    error.value = null
  } catch (err) {
    error.value = err.message || err
    tweets.value = []
  }
}

watch(currentPage, fetchTweets)
onMounted(fetchTweets)
</script>