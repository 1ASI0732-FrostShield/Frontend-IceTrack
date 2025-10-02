<script setup>
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
const { t } = useI18n()
</script>

<template>
  <section>
    <h1 class="text-2xl font-semibold mb-4">{{ t('equipments.list.title') }}</h1>

    <!-- Navegación dentro del contexto Assets-Management -->
    <div class="flex gap-2">
      <RouterLink :to="{ name: 'equipment-detail', params: { equipmentId: '1' } }">
        <Button :label="t('equipments.detail.title')" />
      </RouterLink>
      <RouterLink :to="{ name: 'sites' }">
        <Button :label="t('sites.list.title')" />
      </RouterLink>
    </div>
  </section>
</template>
