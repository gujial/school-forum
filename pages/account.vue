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
                <br>
                <v-btn flat @click="navigateTo(localePath('/follower'))">{{ $t('followerCount') + ' ' + followerCount }}</v-btn>
                <v-btn flat @click="navigateTo(localePath('/following'))">{{ $t('followingCount') + ' ' + followingCount }}</v-btn>
            </v-card-text>
            <v-card-actions>
                <v-btn text @click.stop="logout">{{ $t('logout') }}</v-btn>
            </v-card-actions>
        </v-card>
        <v-divider class="my-4" />
        <h2 style="margin-bottom: 20px;">{{ $t('userTweets') }}</h2>
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
        <v-alert v-if="error != null" type="error">
            {{ error }}
        </v-alert>
        <!-- 删除确认对话框 -->
        <v-dialog v-model="deleteDialog" max-width="400">
            <v-card>
                <v-card-title class="headline">{{ $t('confirmDelete') }}</v-card-title>
                <v-card-text>{{ $t('confirmDeleteMsg') || '确定要删除这条推文吗？' }}</v-card-text>
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
        <v-pagination v-if="total > pageSize" v-model="page" :length="Math.ceil(total / pageSize)" class="my-4" />
    </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Avatar from '~/components/AvatarEditor.vue';
import moment from 'moment-timezone';
import renderMarkdown from '~/util/renderPreviewMarkdown';

const user = ref(null);
const error = ref(null)
const localePath = useLocalePath()
const userTime = ref('')
const tweets = ref([])

const page = ref(1)
const pageSize = 9
const total = ref(0)

const deleteDialog = ref(false)
const deleteId = ref(null)
const editDialog = ref(false)
const editId = ref(null)
const editContent = ref('')

const followerCount = ref(0)
const followingCount = ref(0)

const fetchFollower = async () => {
    if (!user.value) return
    try {
        const res = await $fetch(`/api/follow/get_follower_list`);
        followerCount.value = res.total || 0
    } catch (err) {
        error.value = err
    }
}

const fetchFollowing = async () => {
    if (!user.value) return
    try {
        const res = await $fetch(`/api/follow/get_following_list`);
        followingCount.value = res.total || 0
    } catch (err) {
        error.value = err
    }
}

const fetchTweets = async () => {
    if (!user.value) return
    try {
        const tweetRes = await $fetch(`/api/tweets/user/${user.value.user_id}?page=${page.value}&pageSize=${pageSize}`);
        tweets.value = tweetRes.data || []
        total.value = tweetRes.total || 0
    } catch (err) {
        error.value = err
    }
}

const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    })
}

const deleteTweet = async (tweetId) => {
    try {
        const res = await $fetch(`/api/tweets/${tweetId}`, { method: 'DELETE' })
        if (res.success) {
            // 删除后如果当前页无数据且不是第一页，自动跳转上一页
            await fetchTweets()
            if (tweets.value.length === 0 && page.value > 1) {
                page.value--
                await fetchTweets()
            }
        } else {
            error.value = res.message || '删除失败'
        }
    } catch (err) {推文
        error.value = err
    }
}

const openDeleteDialog = (tweetId) => {
    deleteId.value = tweetId
    deleteDialog.value = true
}

const confirmDelete = async () => {
    if (deleteId.value) {
        await deleteTweet(deleteId.value)
    }
    deleteDialog.value = false
    deleteId.value = null
}

const openEditDialog = (tweet) => {
    editId.value = tweet.tweet_id
    editContent.value = tweet.content
    editDialog.value = true
}

const confirmEdit = async () => {
    if (!editId.value) return
    try {
        const res = await $fetch(`/api/tweets/${editId.value}`, {
            method: 'PUT',
            body: { content: editContent.value }
        })
        if (res.success) {
            await fetchTweets()
            renderMarkdown(editContent.value, `preview${editId.value}`)
            editDialog.value = false
            editId.value = null
            editContent.value = ''
        } else {
            error.value = res.message || '修改失败'
        }
    } catch (err) {
        error.value = err
    }
}

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
        await fetchTweets()
        fetchFollower()
        fetchFollowing()
    } catch (err) {
        if (err.statusCode == 401) {
            navigateTo(localePath('/login'))
        } else {
            error.value = err
        }
    }
});

watch(page, () => {
    fetchTweets()
    scrollToTop()
})

const logout = async () => {
    try {
        const result = await $fetch('/api/auth/logout');
        if (result.success) {
            await fetchAuthUser()
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