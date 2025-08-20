<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card>
          <v-card-title>{{ $t('adminDashboard') }}</v-card-title>
          <v-list>
            <v-list-item :to="localePath('/dashboard/user')">
              <v-list-item-title>
                {{ $t('userManage') }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const currentUser = useAuthUser();
const localePath = useLocalePath();

onMounted(() => {
  if (currentUser.value !== null && !currentUser.value.admin) {
    navigateTo(localePath('/forbidden'))
  }
})

</script>