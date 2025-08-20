<template>
    <v-container>
        <!-- 搜索框 -->
        <v-text-field v-model="search" :label="$t('searchUser')" prepend-inner-icon="mdi-magnify" clearable class="mb-4"
            @keyup.enter="fetchUsers" />

        <!-- 用户表格 -->
        <v-data-table :headers="headers" :items="users" :items-per-page="pageSize" :page.sync="page" :loading="loading"
            :server-items-length="totalUsers" class="elevation-1">
            <template #item.created_at="{ item }">
                {{ new Date(item.created_at).toLocaleString() }}
            </template>
        </v-data-table>

        <v-alert v-if="error != null" type="error">
            {{ error }}
        </v-alert>
    </v-container>
</template>

<script setup lang="ts">
const { t } = useI18n()

const headers = [
    { title: t('id'), key: 'user_id' },
    { title: t('username'), key: 'username' },
    { title: t('email'), key: 'email' },
    { title: t('createdAt'), key: 'created_at' }
]

const users = ref<any[]>([])
const totalUsers = ref(0)
const page = ref(1)
const pageSize = 20
const search = ref('')
const loading = ref(false)

const error = ref<any>(null)

async function fetchUsers() {
    loading.value = true
    try {
        const res = <any>await $fetch('/api/user/list', {
            method: 'GET',
            query: {
                page: page.value,
                pageSize,
                keyword: search.value
            }
        })

        if (res.success) {
            users.value = res.data
            totalUsers.value = res.maxPages * pageSize
        }
    } catch (err) {
        console.error(err)
    } finally {
        loading.value = false
    }
}

onMounted(fetchUsers)

// 监听搜索输入，用户停顿后自动搜索
let searchTimeout: NodeJS.Timeout
watch(search, () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        page.value = 1
        fetchUsers()
    }, 500)
})

watch(error, () => {
    if (error.value) {
        setTimeout(() => {
            error.value = null
        }, 2000)
    }
})
</script>
