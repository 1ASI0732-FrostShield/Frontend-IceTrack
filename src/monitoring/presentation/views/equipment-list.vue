<script setup>

import { useI18n } from 'vue-i18n'
import {onMounted} from "vue";
import useMonitoringStore from "@/monitoring/application/monitoring.store.js";

const {t} = useI18n();
const store = useMonitoringStore();
const { equipments, equipmentsLoaded, errors, fetchEquipments } = store;

onMounted(() => {
  if (!equipmentsLoaded) fetchEquipments();
  console.log(equipments);
});

</script>

<template>
  <section>
    <h1 class="text-2xl font-semibold mb-2">{{ t('equipments.list.title') }}</h1>

    <div class="flex gap-2">
      <div class="p-4">

        <pv-data-table
            :value="equipments"
            :loading="!equipmentsLoaded"
            striped-rows
            table-style="min-width: 80rem"
            paginator
            :rows="5"
            :rows-per-page-options="[5, 10, 20]"
        >

          <!-- Model -->
          <pv-column field="model" :header="t('equipments.list.model')">
            <template #body="slotProps">
              <span
                  :style="{
                  fontWeight: 'bold'
                }"
              >
                {{ slotProps.data.model }}
              </span>
            </template>
          </pv-column>

          <!-- Serial -->
          <pv-column field="type" :header="t('equipments.list.type')">
          </pv-column>

          <!-- Serial -->
          <pv-column field="serial" :header="t('equipments.list.serial')">
          </pv-column>

          <!-- Status -->
          <pv-column field="status" :header="t('equipments.list.status')">
            <template #body="slotProps">
              <span
                  :style="{
                  color:
                    slotProps.data.status === 'active'
                      ? 'green'
                    : slotProps.data.status === 'maintenance'
                      ? 'red'
                      : '',
                  fontWeight: 'bold'
                }"
              >
                {{ slotProps.data.status }}
              </span>
          </template>
          </pv-column>
        </pv-data-table>

        <div v-if="errors.length" class="text-red-500 mt-3">
          {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
        </div>
      </div>

      <RouterLink :to="{ name: 'equipment-detail', params: { equipmentId: '1' } }">
        <pv-button :label="t('equipments.detail.title')" />
      </RouterLink>

    </div>
  </section>
</template>

<style scoped>

</style>
