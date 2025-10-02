<script setup>
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
const { t } = useI18n()
</script>

<template>
  <section>
    <h1 class="text-2xl font-semibold mb-4">{{ t('reports.list.title') }}</h1>

    <!-- Navegación dentro del contexto Reporting -->
    <div class="flex gap-2">
      <RouterLink :to="{ name: 'report-detail', params: { reportId: '1' } }">
        <Button :label="t('reports.detail.title')" />
      </RouterLink>
    </div>
  </section>
</template>
