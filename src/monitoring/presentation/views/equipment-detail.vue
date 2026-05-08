<script setup>

import { useI18n } from 'vue-i18n'
import {onMounted, ref} from "vue";
import useMonitoringStore from "@/monitoring/application/monitoring.store.js";

const { t } = useI18n();
const store = useMonitoringStore();
const { equipments, equipmentsLoaded, errors, fetchEquipments } = store;

onMounted(() => {
  if (!equipmentsLoaded) fetchEquipments();
  console.log(equipments);
});

const selectedEquipment = ref(null);

function showDetails(equipment) {
  selectedEquipment.value = equipment;
}

const isOn = ref(true);
function togglePower() {
  isOn.value = !isOn.value;
}

</script>

<template>
  <section class="p-4">
    <pv-confirm-dialog />

    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="text-3xl font-bold">{{ t('equipments.detail.title') }}</h1>

      <RouterLink :to="{ name: 'equipments' }">
        <pv-button :label="t('equipments.list.title')" />
      </RouterLink>
    </div>

    <!-- Table -->
    <pv-data-table
        :value="equipments"
        :loading="!equipmentsLoaded"
        striped-rows
        table-style="min-width: 80rem"
        paginator
        :rows="5"
        :rows-per-page-options="[5, 10, 20]"
    >
      <!-- Id -->
      <pv-column field="siteId" :header="t('equipments.detail.siteId')" sortable >
      </pv-column>

      <!-- Id -->
      <pv-column field="serial" :header="t('equipments.detail.serial')" sortable >
      </pv-column>

      <!-- Created At -->
      <pv-column field="created" :header="t('equipments.detail.createdAt')" >
      </pv-column>

      <!-- Updated At -->
      <pv-column field="updated" :header="t('equipments.detail.updatedAt')" >
      </pv-column>

      <!-- Botton Alerts -->
      <pv-column :header="t('equipments.controls.info')">
        <template #body="slotProps">

          <pv-button
              :label="t('equipments.controls.more')"
              icon="pi pi-info-circle"
              iconPos="left"
              class="p-button-outlined p-button-rounded custom-alert-btn"
              @click="showDetails(slotProps.data)"
          />

        </template>
      </pv-column>
    </pv-data-table>

    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>

    <!-- Show details -->
    <div v-if="selectedEquipment" class="flex flex-row justify-content-center gap-6 mt-3">
      <!-- Show Owner -->
      <div class="p-6 border shadow bg-gray-50 text-center" style="width: 400px">
        <h2 class="text-blue-700">
          {{ t('equipments.controls.name') }}
        </h2>

        <h3 class="font-bold">
          {{ selectedEquipment.name }}
        </h3>
      </div>

      <!-- Show Online -->
      <div class="p-6 border shadow bg-gray-50 text-center" style="width: 400px">
        <h2 class="text-blue-700">
          {{ t('equipments.controls.online') }}
        </h2>

        <h3 class="font-bold">
          {{ selectedEquipment.online }}
        </h3>
      </div>

      <!-- Show Serial -->
      <div class="p-6 border shadow bg-gray-50 text-center" style="width: 400px">
        <h2 class="text-blue-700">
          {{ t('equipments.list.serial') }}
        </h2>

        <h3 class="font-bold">
          {{ selectedEquipment.serial }}
        </h3>
      </div>
    </div>
  </section>

</template>

<style scoped>

.custom-alert-btn {
  border-color: #2563eb;
  color: #2563eb;
  transition: all 0.3s;
}
.custom-alert-btn:hover {
  background-color: #ebf4ff;
}

</style>
