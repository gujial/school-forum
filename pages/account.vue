<template>
    <v-container v-if="user != null">
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
            <v-card-actions>
                <v-btn text @click.stop="logout">{{ $t('logout') }}</v-btn>
            </v-card-actions>
        </v-card>
        <v-divider class="my-4" />
        <h2>{{ $t('userTweets') }}</h2>
        <v-row>
            <v-col v-for="tweet in tweets" :key="tweet.tweet_id" cols="12" md="6" lg="4">
                <TweetCard :tweet="tweet" />
            </v-col>
        </v-row>
        <v-alert v-if="tweets.length === 0" type="info">{{ $t('noTweets') }}</v-alert>
        <v-alert v-if="error != null" type="error">
            {{ error }}
        </v-alert>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Avatar from '~/components/AvatarEditor.vue';
import moment from 'moment-timezone';

const user = ref(null);
const error = ref(null)
const localePath = useLocalePath()
const userTime = ref('')
const tweets = ref([])

onMounted(async () => {
    try {
        const data = await $fetch('/api/auth/user');
        user.value = data.user;
        if (data.success) {
            const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            userTime.value = moment.utc(user.value.created_at).tz(userTimeZone).format('YYYY-MM-DD HH:mm:ss');
        } else {
            navigateTo(localePath('/login'))
        }
        const tweetRes = await $fetch(`/api/tweets/user/${user.value.user_id}`);
        tweets.value = tweetRes.data || []
    } catch (err) {
        if (err.statusCode == 401) {
            navigateTo(localePath('/login'))
        } else {
            error.value = err
        }
    }
});

const logout = async () => {
    try {
        const result = await $fetch('/api/auth/logout');
        if (result.success) {
            navigateTo(localePath('/'))
        } else {
            error.value = result.message
        }
    } catch (err) {
        error.value = err
    }
}
</script>

<style scoped>
h1 {
    font-size: 2em;
    margin-bottom: 0.5em;
}

p {
    margin: 0.5em 0;
}
</style>