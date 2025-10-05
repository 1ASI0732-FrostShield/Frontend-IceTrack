<script setup>

import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const route = useRoute()

</script>

<template>
  <section>
    <h1 class="text-2xl font-semibold mb-2">{{ t('equipments.list.title') }}</h1>
    <div class="flex gap-2">
      <div class="p-4">

        <pv-data-table
            :value="equipments"
            striped-rows
            table-style="min-width: 80rem"
            paginator
            :rows="5"
            :rows-per-page-options="[5, 10, 20]"
        >

          <!-- Id -->
          <pv-column field="id" :header="t('equipments.list.id')" sortable />

          <!-- Model -->
          <pv-column field="model" :header="t('equipments.list.model')">
            <template #body="slotProps">
              <span class="font-semibold text-gray-800">{{ slotProps.data.alerts }}</span>
            </template>
          </pv-column>

          <!-- Serial -->
          <pv-column field="serial" :header="t('equipments.list.serial')">
            <template #body="slotProps">
              <span class="font-semibold text-gray-800">{{ slotProps.data.alerts }}</span>
            </template>
          </pv-column>

          <!-- Status -->
          <pv-column field="status" :header="t('equipments.list.status')">
            <template #body="slotProps">
              <span class="font-semibold text-gray-800">{{ slotProps.data.alerts }}</span>
            </template>
          </pv-column>
        </pv-data-table>
      </div>

      <RouterLink :to="{ name: 'equipment-detail', params: { equipmentId: '1' } }">
        <pv-button :label="t('equipments.detail.title')" />
      </RouterLink>

    </div>
  </section>
</template>

<style scoped>

</style>
