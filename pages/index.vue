<template>
  <v-container>
    <v-card :image="bgSrc" class="d-flex align-center head-card" color="black">
      <v-avatar v-if="src.length > 0" size="200">
        <v-img cover :src='src' />
      </v-avatar>
      <v-container>
        <v-card-title>{{ $t('welcome') + ' ' + username }}</v-card-title>
        <v-card-text>{{ $t('greeting') }}</v-card-text>
      </v-container>
      <v-card-actions>
        <v-btn text :to="localePath('/edit')">{{ $t('newTweet') }}</v-btn>
      </v-card-actions>
    </v-card>
    <v-row v-if="tweets != null">
      <v-alert v-if="tweets.length == 0" type="info">{{ $t('noTweets') }}</v-alert>
      <v-col v-for="tweet in tweets" v-else :key="tweet.tweet_id" cols="12" md="6" lg="4">
        <TweetCard :tweet="tweet" />
      </v-col>
    </v-row>
    <v-alert v-else type="info">{{ $t('loading') }}</v-alert>
    <v-pagination v-model="currentPage" :length="pageCount" />
    <v-alert v-if="authError">
      {{ $t('pleaseLogin') }}
    </v-alert>
    <v-alert v-if="error != null" type="error" v-show="!authError">
      {{ error }}
    </v-alert>
  </v-container>
</template>

<script setup>
import TweetCard from '~/components/TweetCard.vue';

const tweets = ref(null)
const src = ref('')
const username = ref('')
const user_id = ref(null)
const localePath = useLocalePath()
const currentPage = useState('currentPage', () => 1)
const pageCount = ref(1)
const error = ref(null)
const authError = ref(false)
const bgSrc = ref('/card-image.jpg')

const updateTweets = async () => {
  const data = await $fetch(`/api/tweets/order_by_time/${currentPage.value}`)
  tweets.value = data.data
  pageCount.value = data.maxPages
}

const updateBg = async () => {
  try {
    const data = await $fetch('/api/bg/' + user_id.value);
    bgSrc.value = data.data || '/card-image.jpg';
  } catch (err) {
    bgSrc.value = '/card-image.jpg'
  }
}

watch(currentPage, updateTweets)

onMounted(async () => {
  try {
    const data = await $fetch('/api/auth/user');
    username.value = data.user.username;
    user_id.value = data.user.user_id;
    updateBg();
  } catch (err) {
    // 检查是否为 401 未认证错误
    if (err?.status === 401 || (err?.response && err.response.status === 401)) {
      authError.value = true
    } else {
      error.value = err
    }
  }
  updateTweets();
});
</script>

<style scoped>
.head-card {
  margin-bottom: 20px;
}
</style>