<script setup>

import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const route = useRoute()

</script>

<template>
  <section>
    <h1 class="text-2xl font-semibold mb-2">{{ t('sites.detail.title') }}</h1>

    <div class="flex gap-2">
      <div class="p-4">

        <pv-data-table
            :value="sites"
            striped-rows
            table-style="min-width: 80rem"
            paginator
            :rows="5"
            :rows-per-page-options="[5, 10, 20]"
        >

          <!-- Id -->
          <pv-column field="id" :header="t('sites.list.id')" sortable />

          <!-- Latitude -->
          <pv-column field="latitude" :header="t('sites.detail.latitude')">
            <template #body="slotProps">
              <span class="font-semibold text-gray-800">{{ slotProps.data.alerts }}</span>
            </template>
          </pv-column>

          <!-- Longitude -->
          <pv-column field="longitude" :header="t('sites.detail.longitude')">
            <template #body="slotProps">
              <span class="font-semibold text-gray-800">{{ slotProps.data.alerts }}</span>
            </template>
          </pv-column>

          <!-- Contact Name -->
          <pv-column field="contactName" :header="t('sites.detail.contactName')">
            <template #body="slotProps">
              <span class="font-semibold text-gray-800">{{ slotProps.data.alerts }}</span>
            </template>
          </pv-column>

          <!-- Contact Phone -->
          <pv-column field="contactPhone" :header="t('sites.detail.contactPhone')">
            <template #body="slotProps">
              <span class="font-semibold text-gray-800">{{ slotProps.data.alerts }}</span>
            </template>
          </pv-column>

          <!-- Created At -->
          <pv-column field="createdAt" :header="t('sites.detail.createdAt')">
            <template #body="slotProps">
              <span class="font-semibold text-gray-800">{{ slotProps.data.alerts }}</span>
            </template>
          </pv-column>

          <!-- Updated At -->
          <pv-column field="updatedAt" :header="t('sites.detail.updatedAt')">
            <template #body="slotProps">
              <span class="font-semibold text-gray-800">{{ slotProps.data.alerts }}</span>
            </template>
          </pv-column>
        </pv-data-table>
      </div>

      <RouterLink :to="{ name: 'sites' }">
        <pv-button :label="t('sites.list.title')" />
      </RouterLink>

    </div>

  </section>
</template>

<style scoped>

</style>
