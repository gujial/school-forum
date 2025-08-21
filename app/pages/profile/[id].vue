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

<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import { useRoute } from 'vue-router';
    import Avatar from '~/components/Avatar.vue';
    import UserTweetList from '~/components/UserTweetList.vue';
    import moment from 'moment-timezone';
    import type { User } from '~/types/models';

    const route = useRoute();
    const user = ref<User | null>(null);
    const error = ref<string | null>(null);
    const userTime = ref<string>('');
    const followerCount = ref<number>(0);
    const followingCount = ref<number>(0);
    const localePath = useLocalePath();

    const fetchFollower = async () => {
        if (!user.value) return;
        try {
            const res = await $fetch<{ success: boolean; total?: number }>(
                `/api/follow/get_follower_list/${user.value.user_id}`,
            );
            followerCount.value = res.total || 0;
        } catch (err: unknown) {
            error.value = String(err);
        }
    };

    const fetchFollowing = async () => {
        if (!user.value) return;
        try {
            const res = await $fetch<{ success: boolean; total?: number }>(
                `/api/follow/get_following_list/${user.value.user_id}`,
            );
            followingCount.value = res.total || 0;
        } catch (err: unknown) {
            error.value = String(err);
        }
    };

    onMounted(async () => {
        try {
            const userRes = await $fetch<{ success: boolean; user?: User; message?: string }>(
                `/api/user/${route.params.id}`,
            );
            if (userRes.success !== false && userRes.user) {
                user.value = userRes.user;
                const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                userTime.value = moment
                    .utc(user.value.created_at || '')
                    .tz(userTimeZone)
                    .format('YYYY-MM-DD HH:mm:ss');
                fetchFollower();
                fetchFollowing();
            } else {
                error.value = userRes.message || '用户不存在';
            }
        } catch (err: unknown) {
            error.value = String(err) || String(err);
        }
    });
</script>
