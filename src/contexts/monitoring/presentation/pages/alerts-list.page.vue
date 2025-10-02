<script setup>
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
const { t } = useI18n()
</script>

<template>
  <section>
    <h1 class="text-2xl font-semibold mb-4">{{ t('alerts.list.title') }}</h1>

    <!-- Navegación dentro del contexto Monitoring -->
    <div class="flex gap-2">
      <RouterLink :to="{ name: 'equipment-detail', params: { equipmentId: '1' } }">
        <Button :label="t('equipments.detail.title')" />
      </RouterLink>
    </div>
  </section>
</template>
