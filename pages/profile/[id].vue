<template>
    <v-container v-if="user">
        <v-card>
            <Avatar :user="user" />
            <v-card-title class="headline">
                {{ user.username }}
            </v-card-title>
            <v-card-text>
                {{ $t('email') + ' ' + user.email }}
                <br />
                {{ $t('joinTime') + ' ' + userTime }}
                <br />
                <v-btn flat @click="navigateTo(localePath('/userfollower/' + user.user_id))">{{
                    $t('followerCount') + ' ' + followerCount
                }}</v-btn>
                <v-btn flat @click="navigateTo(localePath('/userfollowing/' + user.user_id))">{{
                    $t('followingCount') + ' ' + followingCount
                }}</v-btn>
            </v-card-text>
        </v-card>
        <v-divider class="my-4" />
        <UserTweetList :user-id="user.user_id" />
    </v-container>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import { useRoute } from 'vue-router';
    import Avatar from '~/components/Avatar.vue';
    import UserTweetList from '~/components/UserTweetList.vue';
    import moment from 'moment-timezone';

    const route = useRoute();
    const user = ref(null);
    const error = ref(null);
    const userTime = ref('');
    const followerCount = ref(0);
    const followingCount = ref(0);
    const localePath = useLocalePath();

    const fetchFollower = async () => {
        if (!user.value) return;
        try {
            const res = await $fetch(`/api/follow/get_follower_list/${user.value.user_id}`);
            followerCount.value = res.total || 0;
        } catch (err) {
            error.value = err;
        }
    };

    const fetchFollowing = async () => {
        if (!user.value) return;
        try {
            const res = await $fetch(`/api/follow/get_following_list/${user.value.user_id}`);
            followingCount.value = res.total || 0;
        } catch (err) {
            error.value = err;
        }
    };

    onMounted(async () => {
        try {
            const userRes = await $fetch(`/api/user/${route.params.id}`);
            if (userRes.success !== false) {
                user.value = userRes.user;
                const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                userTime.value = moment
                    .utc(user.value.created_at)
                    .tz(userTimeZone)
                    .format('YYYY-MM-DD HH:mm:ss');
                fetchFollower();
                fetchFollowing();
            } else {
                error.value = userRes.message || '用户不存在';
            }
        } catch (err) {
            error.value = err.message || err;
        }
    });
</script>
