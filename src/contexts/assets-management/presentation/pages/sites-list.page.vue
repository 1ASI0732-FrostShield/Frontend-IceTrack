<script setup>
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
const { t } = useI18n()
</script>

<template>
  <section>
    <h1 class="text-2xl font-semibold mb-4">{{ t('sites.list.title') }}</h1>

    <!-- Navegación dentro del contexto Assets-Management -->
    <div class="flex gap-2">
      <RouterLink :to="{ name: 'site-detail', params: { siteId: '1' } }">
        <Button :label="t('sites.detail.title')" />
      </RouterLink>
      <RouterLink :to="{ name: 'equipments' }">
        <Button :label="t('equipments.list.title')" />
      </RouterLink>
    </div>
  </section>
</template>
