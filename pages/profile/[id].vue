<!--
这段Vue代码实现了一个用户个人资料页面的功能：

  1、通过路由参数获取用户ID，调用API获取用户信息
  2、使用Avatar组件显示用户头像
  3、展示用户名、邮箱和注册时间等信息
  4、使用UserTweetList组件显示该用户的所有推文
  5、利用moment.js处理时区转换，显示本地化的时间格式-->
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
        <br>
        <v-btn flat @click="navigateTo(localePath('/userfollower/' + user.user_id))">{{ $t('followerCount') + ' ' +
          followerCount }}</v-btn>
        <v-btn flat @click="navigateTo(localePath('/userfollowing/' + user.user_id))">{{ $t('followingCount') + ' ' +
          followingCount
          }}</v-btn>
      </v-card-text>
    </v-card>
    <v-divider class="my-4" />
    <UserTweetList :user-id="user.user_id" />
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Avatar from '~/components/Avatar.vue'
import UserTweetList from '~/components/UserTweetList.vue'
import moment from 'moment-timezone'

const route = useRoute()
const user = ref(null)
const error = ref(null)
const userTime = ref('')
const followerCount = ref(0)
const followingCount = ref(0)
const localePath = useLocalePath()

const fetchFollower = async () => {
  if (!user.value) return
  try {
    const res = await $fetch(`/api/follow/get_follower_list/${user.value.user_id}`);
    followerCount.value = res.total || 0
  } catch (err) {
    error.value = err
  }
}

const fetchFollowing = async () => {
  if (!user.value) return
  try {
    const res = await $fetch(`/api/follow/get_following_list/${user.value.user_id}`);
    followingCount.value = res.total || 0
  } catch (err) {
    error.value = err
  }
}


onMounted(async () => {
  try {
    const userRes = await $fetch(`/api/user/${route.params.id}`)
    if (userRes.success !== false) {
      user.value = userRes.user
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
      userTime.value = moment.utc(user.value.created_at).tz(userTimeZone).format('YYYY-MM-DD HH:mm:ss')
      fetchFollower()
      fetchFollowing()
    } else {
      error.value = userRes.message || '用户不存在'
    }
  } catch (err) {
    error.value = err.message || err
  }
})
</script>