<template>
  <v-container>
    <!-- 搜索框 -->
    <v-text-field
v-model="search" :label="$t('searchUser')" prepend-inner-icon="mdi-magnify" clearable class="mb-4"
      @keyup.enter="fetchUsers" />

    <!-- 用户表格 -->
    <v-data-table
v-model:page="page" :headers="headers" :items="users" :items-per-page="pageSize" :loading="loading"
      :server-items-length="totalUsers" class="elevation-1">

      <template #item.created_at="{ item }">
        {{ item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A' }}
      </template>

      <template #item.admin="{ item }">
        <v-btn v-if="item.admin" flat color="primary" @click="deleteAdmin(item.user_id)">
          {{ $t('deleteAdmin') }}
        </v-btn>
        <v-btn v-else flat color="secondary" @click="addAdmin(item.user_id)">
          {{ $t('addAdmin') }}
        </v-btn>
      </template>

      <template #item.actions="{ item }">
        <v-btn flat color="primary" :to="localePath(`/profile/${item.user_id}`)">
          {{ $t('profile') }}
        </v-btn>
        <v-btn flat color="red" @click="confirmDelete(item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>

    </v-data-table>

    <v-alert v-if="error != null" type="error">
      {{ error }}
    </v-alert>

    <!-- 删除确认对话框 -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h6">
          {{ $t('confirmDeleteTitle') }}
        </v-card-title>
        <v-card-text>
          {{ $t('confirmDeleteMessage') }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="deleteDialog = false">{{ $t('cancel') }}</v-btn>
          <v-btn color="red" text @click="deleteUser">{{ $t('confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'
import { ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const localePath: (_path: string) => string = useLocalePath()

// 表格列类型
interface TableHeader {
  title: string
  key: string
  sortable?: boolean
}

interface User {
  user_id: number
  username: string
  email?: string
  admin?: boolean
  created_at?: string
}

const headers: TableHeader[] = [
  { title: t('id'), key: 'user_id' },
  { title: t('username'), key: 'username' },
  { title: t('email'), key: 'email' },
  { title: t('createdAt'), key: 'created_at' },
  { title: t('admin'), key: 'admin' },
  { title: t('actions'), key: 'actions', sortable: false }
]

// 用户数据
const users: Ref<User[]> = ref([])
const totalUsers: Ref<number> = ref(0)
const page: Ref<number> = ref(1)
const pageSize: number = 20
const search: Ref<string> = ref('')
const loading: Ref<boolean> = ref(false)

// 删除用户对话框状态
const deleteDialog: Ref<boolean> = ref(false)
const userToDelete: Ref<User | null> = ref(null)
const error: Ref<string | null> = ref(null)

const currentUser = useAuthUser() // 假设类型已经在 useAuthUser 中定义

// 添加管理员
async function addAdmin(user_id: number): Promise<void> {
  if (currentUser.value?.user_id === user_id) {
    error.value = '不能修改自己'
    return
  }
  loading.value = true
  try {
    await $fetch<any>(`/api/admin/add/${user_id}`)
    fetchUsers()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 删除管理员
async function deleteAdmin(user_id: number): Promise<void> {
  if (currentUser.value?.user_id === user_id) {
    error.value = '不能修改自己'
    return
  }
  loading.value = true
  try {
    await $fetch<any>(`/api/admin/delete/${user_id}`, { method: 'DELETE' })
    fetchUsers()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 获取用户列表
interface FetchUsersResponse {
  success: boolean
  data: User[]
  maxPages: number
  message?: string
}

async function fetchUsers(): Promise<void> {
  loading.value = true
  try {
    const res = await $fetch<FetchUsersResponse>('/api/user/list', {
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

// 删除用户操作
function confirmDelete(user: User): void {
  if (currentUser.value?.user_id === user.user_id) {
    error.value = '不能删除自己'
    return
  }
  userToDelete.value = user
  deleteDialog.value = true
}

async function deleteUser(): Promise<void> {
  if (!userToDelete.value) return

  try {
    const res = await $fetch<{ success: boolean; message?: string }>(
      `/api/admin/delete_user/${userToDelete.value.user_id}`,
      { method: 'DELETE' }
    )

    if (res.success) {
      users.value = users.value.filter(u => u.user_id !== userToDelete.value!.user_id)
    } else {
      console.error(res.message)
    }
  } catch (err) {
    console.error(err)
  } finally {
    deleteDialog.value = false
  }
}

// 生命周期
onMounted(fetchUsers)

// 搜索防抖
let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    fetchUsers()
  }, 500)
})

// 自动清理 error
watch(error, () => {
  if (error.value) {
    setTimeout(() => {
      error.value = null
    }, 2000)
  }
})
</script>
