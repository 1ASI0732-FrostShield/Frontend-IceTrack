<script setup>
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
const { t } = useI18n()
</script>

<template>
  <section>
    <h1 class="text-2xl font-semibold mb-4">{{ t('services.requests.title') }}</h1>

    <!-- Navegación dentro del contexto Service -->
    <div class="flex gap-2">
      <RouterLink :to="{ name: 'service-new' }"><Button :label="t('services.requests.new')" /></RouterLink>
      <RouterLink :to="{ name: 'service-detail', params: { requestId: '1' } }">
        <Button :label="t('services.requests.detail')" />
      </RouterLink>
    </div>
  </section>
</template>
