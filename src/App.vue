<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/iam/application/auth.store.js'
import { useDashboardConfigStore } from '@/dashboard/application/dashboard-config.store.js'
import { useDashboardDataStore } from '@/dashboard/application/dashboard-data.store.js'

const route = useRoute()
const authStore = useAuthStore()
const dashboardConfigStore = useDashboardConfigStore()
const dashboardDataStore = useDashboardDataStore()

watch( () => authStore.currentUserId, async (currentUserId, previousUserId) => {
      if (currentUserId === previousUserId) return
      
      dashboardConfigStore.$reset()
      dashboardDataStore.$reset()
      
      if (currentUserId && route.path === '/dashboard') {
        await dashboardConfigStore.loadConfigForCurrentUser()
        dashboardDataStore.loadAll(dashboardConfigStore.defaultSiteId)
      }
    }
)
</script>

<template>
  <RouterView />
</template>

<style scoped></style>
