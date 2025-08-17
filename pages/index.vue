<template>
  <v-container>
    <v-card :image="bgSrc" class="d-flex align-center head-card avatar-bg-mask" color="black">
      <div class="bg-mask"></div>
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
    <v-tabs v-model="tab" background-color="primary">
      <v-tab key="all">{{ $t('all') }}</v-tab>
      <v-tab key="school">{{ $t('school') }}</v-tab>
      <v-tab key="school">{{ $t('biaobai') }}</v-tab>
      <v-tab key="school">{{ $t('help') }}</v-tab>
      <v-tab key="school">{{ $t('news') }}</v-tab>
      <v-tab key="more" @click="() => { tab = 0; navigateTo(localePath('/tags')) }">{{ $t('more') }}</v-tab>
    </v-tabs>
    <v-row v-if="tweets != null">
      <v-alert v-if="tweets.length == 0" type="info" style="margin: 20px;">{{ $t('noTweets') }}</v-alert>
      <v-col v-for="tweet in tweets" v-else :key="tweet.tweet_id" cols="12" md="6" lg="4">
        <v-lazy>
          <TweetCard :tweet="tweet" />
        </v-lazy>
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
const tab = ref(0)

const updateTweets = async () => {
  if (tab.value === 0) {
    const data = await $fetch(`/api/tweets/order_by_time/${currentPage.value}`)
    tweets.value = data.data
    pageCount.value = data.maxPages
  } else if (tab.value === 1) {
    const data = await $fetch(`/api/tweets/by_tags_desc?tags=school&page=${currentPage.value}?pageSize=20`)
    tweets.value = data.data
    pageCount.value = data.maxPages
  } else if (tab.value === 2) {
    const data = await $fetch(`/api/tweets/by_tags_desc?tags=school,biaobai&page=${currentPage.value}?pageSize=20`)
    tweets.value = data.data
    pageCount.value = data.maxPages
  } else if (tab.value === 3) {
    const data = await $fetch(`/api/tweets/by_tags_desc?tags=school,help&page=${currentPage.value}?pageSize=20`)
    tweets.value = data.data
    pageCount.value = data.maxPages
  } else if (tab.value === 4) {
    const data = await $fetch(`/api/tweets/by_tags_desc?tags=school,news&page=${currentPage.value}?pageSize=20`)
    tweets.value = data.data
    pageCount.value = data.maxPages
  }
}

const updateBg = async () => {
  try {
    const data = await $fetch('/api/bg/' + user_id.value);
    bgSrc.value = data.data || '/card-image.jpg';
  } catch (err) {
    bgSrc.value = '/card-image.jpg'
  }
}

const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
}

watch(currentPage, () => {
  updateTweets()
  scrollToTop()
})
watch(tab, () => {
  currentPage.value = 1
  updateTweets()
  scrollToTop()
})

onMounted(async () => {
  try {
    const data = await $fetch('/api/auth/user');
    if (!data.user) {
      authError.value = true
      return
    }
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
  position: relative;
  overflow: hidden;
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