<script setup>

import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const route = useRoute()

</script>

<template>
  <section>
    <h1 class="text-2xl font-semibold mb-2">{{ t('equipments.detail.title') }}</h1>

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

          <!-- Installed At -->
          <pv-column field="installedAt" :header="t('equipments.detail.installedAt')">
            <template #body="slotProps">
              <span class="font-semibold text-gray-800">{{ slotProps.data.alerts }}</span>
            </template>
          </pv-column>

          <!-- Last Seen At -->
          <pv-column field="lastSeenAt" :header="t('equipments.detail.lastSeenAt')">
            <template #body="slotProps">
              <span class="font-semibold text-gray-800">{{ slotProps.data.alerts }}</span>
            </template>
          </pv-column>

          <!-- Set Point C -->
          <pv-column field="setpointC" :header="t('equipments.detail.setpointC')">
            <template #body="slotProps">
              <span class="font-semibold text-gray-800">{{ slotProps.data.alerts }}</span>
            </template>
          </pv-column>

          <!-- Created At -->
          <pv-column field="createdAt" :header="t('equipments.detail.createdAt')">
            <template #body="slotProps">
              <span class="font-semibold text-gray-800">{{ slotProps.data.alerts }}</span>
            </template>
          </pv-column>

          <!-- Updated At -->
          <pv-column field="updatedAt" :header="t('equipments.detail.updatedAt')">
            <template #body="slotProps">
              <span class="font-semibold text-gray-800">{{ slotProps.data.alerts }}</span>
            </template>
          </pv-column>
        </pv-data-table>
      </div>

      <RouterLink :to="{ name: 'equipments' }">
        <pv-button :label="t('equipments.list.title')" />
      </RouterLink>

    </div>

  </section>
</template>

<style scoped>

</style>
