<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import PanelMenu from 'primevue/panelmenu'
import { useAuthStore } from '@/iam/application/auth.store.js'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const items = computed(() => {
  if (authStore.currentUserRole === 'provider') {
    return [
      { label: t('nav.provider_dashboard'), icon: 'pi pi-th-large', command: () => router.push({ name: 'provider-dashboard' }) },
      { label: t('nav.provider_services'), icon: 'pi pi-briefcase', command: () => router.push({ name: 'provider-services-hub' }) },
      { label: t('nav.technician_management'), icon: 'pi pi-users', command: () => router.push({ name: 'provider-technicians' }) },
    ];
  }

  // Default items for Owner
  return [
    { label: t('nav.dashboard'), icon: 'pi pi-home', command: () => router.push({ name: 'dashboard' }) },
    { label: t('nav.sites'), icon: 'pi pi-building', command: () => router.push({ name: 'sites' }) },
    { label: t('nav.equipments'), icon: 'pi pi-server', command: () => router.push({ name: 'equipments' }) },
    { label: t('nav.services'), icon: 'pi pi-briefcase', command: () => router.push({ name: 'service-requests-list' }) },
    { label: t('nav.alerts'), icon: 'pi pi-bell', command: () => router.push({ name: 'alerts' }) },
    { label: t('nav.reports'), icon: 'pi pi-chart-line', command: () => router.push({ name: 'reporting-report' }) },
  ];
});
</script>

<template>
  <aside class="sidebar">
    <PanelMenu :model="items" class="w-full" />
  </aside>
</template>

<style scoped>
.sidebar{
  padding:8px;
  border-right:1px solid var(--p-surface-200);
  background: var(--p-surface-0);
  height: calc(100vh - 64px);
  overflow:auto;
}
</style>