<template>
    <div>
        <v-container v-if="user != null">
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
                    <v-btn flat @click="navigateTo(localePath('/follower'))">{{
                        $t('followerCount') + ' ' + followerCount
                    }}</v-btn>
                    <v-btn flat @click="navigateTo(localePath('/following'))">{{
                        $t('followingCount') + ' ' + followingCount
                    }}</v-btn>
                </v-card-text>
                <v-list>
                    <v-list-item @click="openUsernameDialog">
                        <v-list-item-title>{{ $t('modifyUsername') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="openPasswordDialog">
                        <v-list-item-title>{{ $t('modifyPassword') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="openEmailDialog">
                        <v-list-item-title>{{ $t('modifyEmail') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="openDeleteAccountDialog">
                        <v-list-item-title>{{ $t('deleteAccount') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="logout">
                        <v-list-item-title>{{ $t('logout') }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-card>
            <v-alert v-if="error != null" type="error">
                {{ error }}
            </v-alert>
            <v-alert v-if="suc != null" type="success">
                {{ suc }}
            </v-alert>
            <v-divider class="my-4" />
            <h2 style="margin-bottom: 20px">{{ $t('userTweets') }}</h2>
            <v-row>
                <v-col v-for="tweet in tweets" :key="tweet.tweet_id" cols="12" md="6" lg="4">
                    <v-lazy>
                        <v-card>
                            <TweetCard :tweet="tweet" />
                            <v-card-actions>
                                <v-btn color="primary" text @click="openEditDialog(tweet)">
                                    {{ $t('edit') }}
                                </v-btn>
                                <v-btn color="error" text @click="openDeleteDialog(tweet.tweet_id)">
                                    {{ $t('delete') }}
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-lazy>
                </v-col>
                <v-alert v-if="tweets.length === 0" type="info">{{ $t('noTweets') }}</v-alert>
            </v-row>
            <!-- 删除确认对话框 -->
            <v-dialog v-model="deleteDialog" max-width="400">
                <v-card>
                    <v-card-title class="headline">{{ $t('confirmDelete') }}</v-card-title>
                    <v-card-text>{{
                        $t('confirmDeleteMsg') || '确定要删除这条推文吗？'
                    }}</v-card-text>
                    <v-card-actions>
                        <v-spacer />
                        <v-btn text @click="deleteDialog = false">{{ $t('cancel') }}</v-btn>
                        <v-btn color="error" text @click="confirmDelete">{{ $t('delete') }}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <!-- 编辑推文对话框 -->
            <v-dialog v-model="editDialog" max-width="600">
                <v-card>
                    <v-card-title class="headline">{{ $t('editTweet') }}</v-card-title>
                    <v-card-text>
                        <v-textarea v-model="editContent" :label="$t('tweetContent')" rows="4" />
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer />
                        <v-btn text @click="editDialog = false">{{ $t('cancel') }}</v-btn>
                        <v-btn color="primary" text @click="confirmEdit">{{ $t('save') }}</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-pagination
                v-if="total > pageSize"
                v-model="page"
                :length="Math.ceil(total / pageSize)"
                class="my-4"
            />
        </v-container>
        <!-- 修改用户名 -->
        <v-dialog v-model="usernameDialog" max-width="400">
            <v-card>
                <v-card-title class="headline">{{ $t('modifyUsername') }}</v-card-title>
                <v-card-text>
                    <v-text-field v-model="newUsername" :label="$t('newUsername')" />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="usernameDialog = false">{{ $t('cancel') }}</v-btn>
                    <v-btn color="primary" text @click="confirmUsername">{{ $t('save') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 修改密码 -->
        <v-dialog v-model="passwordDialog" max-width="400">
            <v-card>
                <v-card-title class="headline">{{ $t('modifyPassword') }}</v-card-title>
                <v-card-text>
                    <v-text-field
                        v-model="oldPassword"
                        :label="$t('oldPassword')"
                        type="password"
                    />
                    <v-text-field
                        v-model="newPassword"
                        :label="$t('newPassword')"
                        type="password"
                    />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="passwordDialog = false">{{ $t('cancel') }}</v-btn>
                    <v-btn color="primary" text @click="confirmPassword">{{ $t('save') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 删除账户 -->
        <v-dialog v-model="deleteAccountDialog" max-width="400">
            <v-card>
                <v-card-title class="headline">{{ $t('deleteAccount') }}</v-card-title>
                <v-card-text>
                    {{ $t('deleteAccountMsg') || '确定要永久删除账号吗？此操作不可恢复！' }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="deleteAccountDialog = false">{{ $t('cancel') }}</v-btn>
                    <v-btn color="error" text @click="confirmDeleteAccount">{{
                        $t('delete')
                    }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- 修改邮箱 -->
        <v-dialog v-model="emailDialog" max-width="400">
            <v-card>
                <v-card-title class="headline">{{ $t('modifyEmail') }}</v-card-title>
                <v-card-text>
                    <v-text-field v-model="newEmail" :label="$t('newEmail')" type="email" />
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn text @click="emailDialog = false">{{ $t('cancel') }}</v-btn>
                    <v-btn color="primary" text @click="confirmEmail">{{ $t('save') }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
    import { ref, onMounted, watch } from 'vue';
    import Avatar from '~/components/AvatarEditor.vue';
    import type { Tweet, ApiResponse } from '~/types/models';

    // ==== 状态 ====
    const user = useAuthUser();
    const error = ref<string | null>(null);
    const suc = ref<string | null>(null);

    const localePath = useLocalePath();
    const userTime = ref<string>('');

    const tweets = ref<Tweet[]>([]);
    const page = ref<number>(1);
    const pageSize = 9;
    const total = ref<number>(0);

    const deleteDialog = ref<boolean>(false);
    const deleteId = ref<number | null>(null);

    const editDialog = ref<boolean>(false);
    const editId = ref<number | null>(null);
    const editContent = ref<string>('');

    const followerCount = ref<number>(0);
    const followingCount = ref<number>(0);

    const usernameDialog = ref<boolean>(false);
    const passwordDialog = ref<boolean>(false);
    const deleteAccountDialog = ref<boolean>(false);
    const emailDialog = ref<boolean>(false);

    const newUsername = ref<string>('');
    const oldPassword = ref<string>('');
    const newPassword = ref<string>('');
    const newEmail = ref<string>('');

    // ==== 方法 ====
    const openEmailDialog = () => {
        newEmail.value = user.value?.email || '';
        emailDialog.value = true;
    };

    const confirmEmail = async () => {
        try {
            const res = await $fetch<ApiResponse>('/api/user/modify_email', {
                method: 'PUT',
                body: { email: newEmail.value },
            });
            if (res.success) {
                error.value = null;
                suc.value = '修改成功';
                if (user.value) user.value.email = newEmail.value;
                emailDialog.value = false;
            } else {
                error.value = res.message || '修改失败';
                emailDialog.value = false;
            }
        } catch (err: unknown) {
            emailDialog.value = false;
            error.value = String(err);
        }
    };

    const openUsernameDialog = () => {
        newUsername.value = user.value?.username || '';
        usernameDialog.value = true;
    };

    const openPasswordDialog = () => {
        oldPassword.value = '';
        newPassword.value = '';
        passwordDialog.value = true;
    };

    const openDeleteAccountDialog = () => {
        deleteAccountDialog.value = true;
    };

    const confirmUsername = async () => {
        try {
            const res = await $fetch<ApiResponse>('/api/user/modify_username', {
                method: 'PUT',
                body: { username: newUsername.value },
            });
            if (res.success) {
                error.value = null;
                suc.value = '修改成功';
                if (user.value) user.value.username = newUsername.value;
                usernameDialog.value = false;
            } else {
                error.value = res.message || '修改失败';
                usernameDialog.value = false;
            }
        } catch (err: unknown) {
            usernameDialog.value = false;
            error.value = String(err);
        }
    };

    const confirmPassword = async () => {
        try {
            const res = await $fetch<ApiResponse>('/api/user/modify_password', {
                method: 'PUT',
                body: { oldPassword: oldPassword.value, newPassword: newPassword.value },
            });
            if (res.success) {
                error.value = null;
                suc.value = '修改成功';
                passwordDialog.value = false;
            } else {
                error.value = res.message || '修改失败';
                passwordDialog.value = false;
            }
        } catch (err: unknown) {
            passwordDialog.value = false;
            error.value = String(err);
        }
    };

    const confirmDeleteAccount = async () => {
        try {
            const res = await $fetch<ApiResponse>('/api/user/delete_account', { method: 'DELETE' });
            if (res.success) {
                error.value = null;
                await fetchAuthUser();
                navigateTo(localePath('/'));
            } else {
                error.value = res.message || '删除失败';
            }
        } catch (err: unknown) {
            error.value = String(err);
        }
    };

    const fetchFollower = async () => {
        if (!user.value) return;
        try {
            const res = await $fetch<{ total: number }>(`/api/follow/get_follower_list`);
            followerCount.value = res.total || 0;
        } catch (err: unknown) {
            error.value = String(err);
        }
    };

    const fetchFollowing = async () => {
        if (!user.value) return;
        try {
            const res = await $fetch<{ total: number }>(`/api/follow/get_following_list`);
            followingCount.value = res.total || 0;
        } catch (err: unknown) {
            error.value = String(err);
        }
    };

    const fetchTweets = async () => {
        if (!user.value) return;
        try {
            const tweetRes = await $fetch<{ data: Tweet[]; total: number }>(
                `/api/tweets/user/${user.value.user_id}?page=${page.value}&pageSize=${pageSize}`,
            );
            tweets.value = tweetRes.data || [];
            total.value = tweetRes.total || 0;
        } catch (err: unknown) {
            error.value = String(err);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteTweet = async (tweetId: number) => {
        try {
            const res = await $fetch<ApiResponse>(`/api/tweets/${tweetId}`, { method: 'DELETE' });
            if (res.success) {
                await fetchTweets();
                if (tweets.value.length === 0 && page.value > 1) {
                    page.value--;
                    await fetchTweets();
                }
            } else {
                error.value = res.message || '删除失败';
            }
        } catch (err: unknown) {
            error.value = String(err);
        }
    };

    const openDeleteDialog = (tweetId: number) => {
        deleteId.value = tweetId;
        deleteDialog.value = true;
    };

    const confirmDelete = async () => {
        if (deleteId.value) {
            await deleteTweet(deleteId.value);
        }
        deleteDialog.value = false;
        deleteId.value = null;
    };

    const openEditDialog = (tweet: Tweet) => {
        editId.value = tweet.tweet_id;
        editContent.value = tweet.content;
        editDialog.value = true;
    };

    const confirmEdit = async () => {
        if (!editId.value) return;
        try {
            const res = await $fetch<ApiResponse>(`/api/tweets/${editId.value}`, {
                method: 'PUT',
                body: { content: editContent.value },
            });
            if (res.success) {
                await fetchTweets();
                editDialog.value = false;
                editId.value = null;
                editContent.value = '';
            } else {
                error.value = res.message || '修改失败';
            }
        } catch (err: unknown) {
            error.value = String(err);
        }
    };

    onMounted(async () => {
        if (user.value && user.value.user_id === -1) {
            navigateTo(localePath('/login'));
        }
        try {
            await fetchTweets();
            await fetchFollower();
            await fetchFollowing();
        } catch (err: unknown) {
            const statusCode = (err as { statusCode?: number })?.statusCode;

            if (statusCode === 401) {
                navigateTo(localePath('/login'));
            } else {
                error.value = String(err);
            }
        }
    });

    watch(page, () => {
        fetchTweets();
        scrollToTop();
    });

    watch(suc, () => {
        if (suc.value) {
            setTimeout(() => (suc.value = null), 2000);
        }
    });

    watch(error, () => {
        if (error.value) {
            setTimeout(() => (error.value = null), 2000);
        }
    });

    const logout = async () => {
        try {
            const result = await $fetch<ApiResponse>('/api/auth/logout');
            if (result.success) {
                await fetchAuthUser();
                navigateTo(localePath('/'));
            } else {
                error.value = result.message || '登出失败';
            }
        } catch (err: unknown) {
            error.value = String(err);
        }
    };
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
