<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import PanelMenu from 'primevue/panelmenu'

const router = useRouter()
const { t } = useI18n()

const items = computed(() => [
  { label: t('nav.dashboard'), icon: 'pi pi-home', command: () => router.push({ name: 'dashboard' }) },
  { label: t('nav.sites'), icon: 'pi pi-building', command: () => router.push({ name: 'sites' }) },
  { label: t('nav.equipments'), icon: 'pi pi-server', command: () => router.push({ name: 'equipments' }) },
  { label: t('nav.services'), icon: 'pi pi-briefcase', command: () => router.push({ name: 'services' }) },
  { label: t('nav.alerts'), icon: 'pi pi-bell', command: () => router.push({ name: 'alerts' }) },
  { label: t('nav.reports'), icon: 'pi pi-chart-line', command: () => router.push({ name: 'reports' }) },
  { label: t('nav.admin'), icon: 'pi pi-cog', command: () => router.push({ name: 'admin-users' }) },
])
</script>

<template>
  <aside class="sidebar">
    <pv-panel-menu :model="items" class="w-full" />
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
