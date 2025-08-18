<template>
  <div class="page-wrapper" :style="{ backgroundImage: `url(${pageBgSrc})` }">
    <div class="page-overlay">
      <v-container>
        <!-- 修改背景图片显示方式，使用自定义背景容器 -->
        <v-card class="d-flex align-center head-card avatar-bg-mask" color="black">
          <div class="background-container">
            <div class="background-image" :style="{ backgroundImage: `url(${bgSrc})` }"></div>
            <div class="bg-mask"></div>
          </div>
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
          <v-tab key="biaobai">{{ $t('biaobai') }}</v-tab>
          <v-tab key="help">{{ $t('help') }}</v-tab>
          <v-tab key="news">{{ $t('news') }}</v-tab>
          <v-tab key="map">{{ $t('map') }}</v-tab>
          <v-tab key="more" @click="() => { tab = 0; navigateTo(localePath('/tags')) }">{{ $t('more') }}</v-tab>
        </v-tabs>
        <v-row v-if="tweets != null">
          <v-alert v-if="tweets.length == 0 && tab != 5" type="info" style="margin: 20px;">{{ $t('noTweets') }}</v-alert>
          <v-col v-for="tweet in tweets" v-else :key="tweet.tweet_id" cols="12" md="6" lg="4">
            <TweetCard :tweet="tweet" />
          </v-col>
        </v-row>
        <v-alert v-else type="info">{{ $t('loading') }}</v-alert>
        <v-row v-if="tab == 5">
          <iframe width="100%" height="700"
            src="https://www.openstreetmap.org/export/embed.html?bbox=115.7815223787844%2C28.650561869520143%2C115.80765782342552%2C28.668750457195618&amp;layer=mapnik"
            style="border: 1px solid black; margin: 20px;"></iframe><br /><small><a
              href="https://www.openstreetmap.org/?#map=16/28.65966/115.79459">查看更大的地图</a></small>
        </v-row>
        <v-pagination v-if="tab != 5" v-model="currentPage" :length="pageCount" />
        <v-alert v-if="authError">
          {{ $t('pleaseLogin') }}
        </v-alert>
        <v-alert v-if="error != null" type="error" v-show="!authError">
          {{ error }}
        </v-alert>
      </v-container>
    </div>
  </div>
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
// 使用特定的固定背景图路径
const pageBgSrc = ref('/background_image.jpg')
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
  } else if (tab.value === 5) {
    tweets.value = []
    pageCount = 1
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
.page-wrapper {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  padding: 0;
}

.page-overlay {
  background-color: rgba(255, 255, 255, 0.85);
  /* 半透明背景增强可读性 */
  min-height: 100vh;
}

.head-card {
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  min-height: 300px;
  /* 设置最小高度确保背景有足够的显示空间 */
}

/* 新增背景容器样式 */
.background-container {
  position: absolute;
  /* 绝对定位 ，相对于最近的已定位元素*/
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -2;
}

/* 背景图片样式 - 使用缩放以覆盖整个容器 */
.background-image {
  position: absolute;
  top: -50px;
  /* 向上扩展50px */
  left: -80px;
  /* 向左扩展50px */
  right: -80px;
  /* 向右扩展50px */
  bottom: -20px;
  /* 向下扩展50px */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transform: scale(1.2);
  /* 放大1.2倍 */
  z-index: -2;
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

.welcome-title {
  font-size: 16rem !important;
  /* 使用 !important 确保样式优先级 */
  font-weight: bold !important;
}
</style>