<!--推文卡片组件，展示用户信息、发布时间、内容及媒体（图片/视频）。-->
<template>
  <v-card
    v-if="user != null" class="mb-3" :prepend-avatar="avatar_url" :title="user.username" :subtitle="userTime"
    style="display: flex; flex-direction: column;" @click="goToDetail">
    <v-divider/>
    <v-alert v-if="error != null" type="error">
      {{ error }}
    </v-alert>
    <v-card-text :class="{'text-content': !hasMedia, 'content': hasMedia}" :id="`preview${tweet.tweet_id}`">
    </v-card-text>
    <v-carousel v-if="images.length > 0" height="300px" cycle :show-arrows="false" hide-delimiters>
      <v-carousel-item v-for="image in images" :key="image.media_id" :src="image.media_url" cover/>
    </v-carousel>
    <video v-if="video != null" :src="video" height="300px" muted autoplay loop/>
    <v-card-actions class="d-flex justify-end">
      <v-btn icon @click.stop="likeTweet">
        <v-icon v-if="isLike">
          mdi-thumb-up
        </v-icon>
        <v-icon v-else>
          mdi-thumb-up-outline
        </v-icon>
      </v-btn>
      <span class="mr-4">{{ likeCount }}</span>
      <v-icon small class="mr-1">mdi-comment-outline</v-icon>
      <span>{{ commentCount }}</span>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import moment from 'moment-timezone';
import renderMarkdown from '~/util/renderPreviewMarkdown';
import 'vditor/dist/index.css';

const isLike = ref(false)
const localePath = useLocalePath();

const props = defineProps({
  tweet: {
    type: Object,
    required: true
  }
});

const { tweet } = toRefs(props);
const router = useRouter();

const user = ref(null)
const avatar_url = ref('/icon.png')
const error = ref(null)
const images = ref([])
const video = ref(null)
const likeCount = ref(0)
const commentCount = ref(0)

const goToDetail = () => {
  router.push(localePath(`/detail/${tweet.value.tweet_id}`));
};

const likeTweet = async () => {
  try {
    await $fetch(`/api/tweets/like/${tweet.value.tweet_id}`)
    updateLike()
    await fetchCounts()
  } catch(err) {
    if (err.statusCode == 401) {
      navigateTo(localePath('/login'))
    }
  }
};

const updateLike = async () => {
    try {
      const data = await $fetch(`/api/tweets/like/check/${tweet.value.tweet_id}`)
      isLike.value = data.like
    } catch(err) {
      console.log(err)
    }
}

const fetchCounts = async () => {
  try {
    const likeRes = await $fetch(`/api/tweets/like/count/${tweet.value.tweet_id}`)
    likeCount.value = likeRes.count || 0
    const commentRes = await $fetch(`/api/tweets/comment/count/${tweet.value.tweet_id}`)
    commentCount.value = commentRes.count || 0
  } catch (e) {
    console.error('Error fetching counts:', e);
  }
}

onMounted(async () => {
  try {
    const user_data = await $fetch(`/api/user/${tweet.value.user_id}`)
    user.value = user_data.user
    const avatar_data = await $fetch(`/api/avatar/${user.value.user_id}`)
    avatar_url.value = avatar_data.data

    const media_data = await $fetch(`/api/media/${tweet.value.tweet_id}`)
    if (media_data.data.length > 0) {
      if (media_data.data[0].media_type == "video") {
        video.value = media_data.data[0].media_url
      } else {
        for (const data of media_data.data) {
          images.value.push(data)
        }
      }
    }
  } catch(err) {
    error.value = err
  }
  updateLike()
  await fetchCounts()
  renderMarkdown(tweet.value.content, `preview${tweet.value.tweet_id}`);
})

const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const userTime = moment.utc(tweet.value.created_at).tz(userTimeZone).format('YYYY-MM-DD HH:mm:ss');

const hasMedia = computed(() => images.value.length > 0 || video.value != null);
</script>

<style scoped>
.mb-3 {
  margin-bottom: 16px;
}

.content {
  white-space: nowrap;
  overflow: hidden;
  /* 隐藏溢出内容 */
  text-overflow: ellipsis;
  /* 添加省略号 */
  height: 50px;
}

::v-deep(.vditor-reset p){
  text-overflow: ellipsis;
  overflow: hidden;
}

.text-content {
  height: 350px;
  /* 设置最大高度 */
  overflow-y: auto;
}
</style>
