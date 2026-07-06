<script setup>
import { computed } from 'vue'
import { useI18n } from '@/i18n.js'
import { useRouter } from 'vue-router'
import PanelMenu from 'primevue/panelmenu'
import { useAuthStore } from '@/iam/application/auth.store.js'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const items = computed(() => {
  if (authStore.currentUserRole === 'Provider') {
    return [
      { label: t('nav.provider_dashboard'), icon: 'pi pi-th-large', command: () => router.push({ name: 'provider-dashboard' }) },
      {
        label: t('nav.provider_services'),
        icon: 'pi pi-briefcase',
        items: [
          { label: 'Centro de Servicios', icon: 'pi pi-sitemap', command: () => router.push({ name: 'provider-services-hub' }) },
          { label: 'Todos los Servicios', icon: 'pi pi-list', command: () => router.push({ name: 'provider-services-list' }) },
        ]
      },
      { label: t('nav.technician_management'), icon: 'pi pi-users', command: () => router.push({ name: 'provider-technicians' }) },
      { label: t('nav.configurations'), icon: 'pi pi-cog', command: () => router.push({ name: 'configurations' }) },
    ];
  }

  // Default items for Owner
  return [
    { label: t('nav.dashboard'), icon: 'pi pi-home', command: () => router.push({ name: 'dashboard' }) },
    { label: t('nav.sites'), icon: 'pi pi-building', command: () => router.push({ name: 'sites' }) },
    { label: t('nav.equipments'), icon: 'pi pi-server', command: () => router.push({ name: 'equipments' }) },
    { label: t('nav.services'), icon: 'pi pi-briefcase', command: () => router.push({ name: 'service-requests-list' }) },
    { label: t('nav.configurations'), icon: 'pi pi-cog', command: () => router.push({ name: 'configurations' }) },
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
  border-right:1px solid var(--app-border);
  background: var(--app-surface);
  height: calc(100vh - 64px);
  overflow:auto;
  color: var(--app-text);
}
</style>
