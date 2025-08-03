<template>
  <v-container v-if="user">
    <v-card>
      <Avatar :user="user" />
      <v-card-title class="headline">
        {{ user.username }}
      </v-card-title>
      <v-card-text>
        {{ $t('email') + ' ' + user.email }}
        <br>
        {{ $t('joinTime') + ' ' + userTime }}
      </v-card-text>
    </v-card>
    <v-divider class="my-4"/>
    <h2>{{ $t('userTweets') }}</h2>
    <v-row>
      <v-col v-for="tweet in tweets" :key="tweet.tweet_id" cols="12" md="6" lg="4">
        <TweetCard :tweet="tweet" />
      </v-col>
    </v-row>
    <v-alert v-if="tweets.length === 0" type="info">{{ $t('noTweets') }}</v-alert>
    <v-alert v-if="error" type="error">{{ error }}</v-alert>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Avatar from '~/components/Avatar.vue'
import TweetCard from '~/components/TweetCard.vue'
import moment from 'moment-timezone'

const route = useRoute()
const user = ref(null)
const tweets = ref([])
const error = ref(null)
const userTime = ref('')

onMounted(async () => {
  try {
    const userRes = await $fetch(`/api/user/${route.params.id}`)
    if (userRes.success !== false) {
      user.value = userRes.user
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
      userTime.value = moment.utc(user.value.created_at).tz(userTimeZone).format('YYYY-MM-DD HH:mm:ss')
    } else {
      error.value = userRes.message || '用户不存在'
    }
    const tweetRes = await $fetch(`/api/tweets/user/${route.params.id}`)
    tweets.value = tweetRes.data || []
  } catch (err) {
    error.value = err.message || err
  }
})
</script>