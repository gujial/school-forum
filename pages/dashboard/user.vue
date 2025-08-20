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
        {{ new Date(item.created_at).toLocaleString() }}
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
const { t } = useI18n()
const localePath = useLocalePath()
const headers = [
  { title: t('id'), key: 'user_id' },
  { title: t('username'), key: 'username' },
  { title: t('email'), key: 'email' },
  { title: t('createdAt'), key: 'created_at' },
  { title: t('admin'), key: 'admin' },
  { title: t('actions'), key: 'actions', sortable: false }
]

const users = ref<any[]>([])
const totalUsers = ref(0)
const page = ref(1)
const pageSize = 20
const search = ref('')
const loading = ref(false)

const deleteDialog = ref(false)
const userToDelete = ref<any>(null)
const error = ref<string | null>(null)
const currentUser = useAuthUser()

async function addAdmin(user_id: number) {
  if (currentUser.value && currentUser.value.user_id === user_id) {
    error.value = '不能修改自己'
    return
  }
  loading.value = true
  try {
    await $fetch('/api/admin/add/' + user_id)
    fetchUsers()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function deleteAdmin(user_id: number) {
  if (currentUser.value && currentUser.value.user_id === user_id) {
    error.value = '不能修改自己'
    return
  }
  loading.value = true
  try {
    await $fetch('/api/admin/delete/' + user_id, { method: 'DELETE' })
    fetchUsers()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function fetchUsers() {
  loading.value = true
  try {
    const res = await $fetch('/api/user/list', {
      method: 'GET',
      query: {
        page: page.value,
        pageSize,
        keyword: search.value
      }
    }) as any

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

function confirmDelete(user: any) {
  if (currentUser.value && currentUser.value.user_id === user.user_id) {
    error.value = '不能删除自己'
    return
  }
  userToDelete.value = user
  deleteDialog.value = true
}

async function deleteUser() {
  if (!userToDelete.value) return
  try {
    const res = await $fetch(`/api/admin/delete_user/${userToDelete.value.user_id}`, {
      method: 'DELETE'
    }) as any

    if (res.success) {
      users.value = users.value.filter(u => u.user_id !== userToDelete.value.user_id)
    } else {
      console.error(res.message)
    }
  } catch (err) {
    console.error(err)
  } finally {
    deleteDialog.value = false
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
