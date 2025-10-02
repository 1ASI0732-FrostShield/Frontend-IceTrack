<script setup>
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
const { t } = useI18n()
</script>

<template>
  <section>
    <h1 class="text-2xl font-semibold mb-4">{{ t('admin.settings.title') }}</h1>

    <!-- Navegación dentro del contexto IAM -->
    <div class="flex gap-2">
      <RouterLink :to="{ name: 'admin-users' }">
        <Button :label="t('admin.users.title')" />
      </RouterLink>
    </div>
  </section>
</template>
