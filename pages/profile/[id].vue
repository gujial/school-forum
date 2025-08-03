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
  } catch (err) {
    error.value = err.message || err
  }
})
</script>