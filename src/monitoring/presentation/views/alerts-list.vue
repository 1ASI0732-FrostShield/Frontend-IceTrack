<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import { RouterLink } from "vue-router";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import useMonitoringStore from "@/monitoring/application/monitoring.store.js";

const { t } = useI18n();
const confirm = useConfirm();
const toast = useToast();

const store = useMonitoringStore();
const { alerts, alertsLoaded, errors } = storeToRefs(store);
const { fetchAlerts, deleteAlert } = store;

const selectedType = ref(null);
const selectedEquipment = ref(null);
const dateFrom = ref(null);
const dateTo = ref(null);

const typeOptions = computed(() => [
  { label: t("alerts.types.highTemperature"), value: "highTemperature" },
  { label: t("alerts.types.powerLoss"), value: "powerLoss" },
  { label: t("alerts.types.sensorOffline"), value: "sensorOffline" },
]);

const equipmentOptions = computed(() => {
  const ids = [...new Set(alerts.value.map(a => a.equipmentId))];
  return ids.map(id => ({ label: id, value: id }));
});

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

const filteredAlerts = computed(() => {
  return alerts.value.filter(alert => {
    const matchesType = !selectedType.value || alert.type === selectedType.value;
    const matchesEquipment = !selectedEquipment.value || alert.equipmentId === selectedEquipment.value;
    const alertDate = new Date(alert.createdAt ?? alert.timestamp ?? alert.ts);
    const matchesDateFrom = !dateFrom.value || alertDate >= new Date(dateFrom.value);
    const matchesDateTo = !dateTo.value || alertDate <= new Date(dateTo.value);
    return matchesType && matchesEquipment && matchesDateFrom && matchesDateTo;
  });
});
function confirmAcknowledge(alert) {
  confirm.require({
    message: t("alerts.ack.confirmMessage", "¿Marcar esta alerta como atendida?"),
    header: t("alerts.ack.confirmTitle", "Acknowledge Alert"),
    icon: "pi pi-check-circle",
    acceptLabel: t("alerts.ack.accept", "Acknowledge"),
    rejectLabel: t("alerts.ack.reject", "Cancelar"),
    accept: async () => {
      try {
        await deleteAlert(alert.id); // <- sigue usando deleteAlert
        toast.add({ severity: "success", summary: t("alerts.ack.success", "Alerta reconocida"), life: 2000 });
      } catch (err) {
        toast.add({ severity: "error", summary: t("alerts.ack.error", "Error al reconocer alerta"), life: 3000 });
      }
    },
  });
}

onMounted(() => {
  if (!alertsLoaded.value) fetchAlerts();
});
</script>

<template>
  <section>
    <h1 class="text-2xl font-semibold mb-4 text-gray-800">
      {{ t("alerts.list.title") }}
    </h1>

    <div class="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm items-end">
      <div class="flex flex-col">
        <label class="text-sm font-medium text-gray-600 mb-1">
          {{ t("alerts.list.type") }}
        </label>
        <pv-dropdown
            v-model="selectedType"
            :options="typeOptions"
            option-label="label"
            option-value="value"
            :placeholder="t('alerts.placeholders.selectType')"
            class="w-56"
        />
      </div>

      <div class="flex flex-col">
        <label class="text-sm font-medium text-gray-600 mb-1">
          {{ t("alerts.list.equipment") }}
        </label>
        <pv-dropdown
            v-model="selectedEquipment"
            :options="equipmentOptions"
            option-label="label"
            option-value="value"
            :placeholder="t('alerts.placeholders.selectEquipment')"
            class="w-56"
        />
      </div>

      <div class="flex flex-col">
        <label class="text-sm font-medium text-gray-600 mb-1">
          {{ t("alerts.list.dateFrom") }}
        </label>
        <pv-calendar v-model="dateFrom" show-icon date-format="yy-mm-dd" class="w-48" />
      </div>

      <div class="flex flex-col">
        <label class="text-sm font-medium text-gray-600 mb-1">
          {{ t("alerts.list.dateTo") }}
        </label>
        <pv-calendar v-model="dateTo" show-icon date-format="yy-mm-dd" class="w-48" />
      </div>

      <pv-button
          :label="t('alerts.list.clear')"
          icon="pi pi-times"
          class="!bg-gray-300 hover:!bg-gray-400 text-gray-800 !py-2 !px-4 rounded-lg"
          @click="selectedType = selectedEquipment = dateFrom = dateTo = null"
      />
    </div>

    <div class="p-4 bg-white rounded-2xl shadow-md">
      <pv-data-table
          :value="filteredAlerts"
          :loading="!alertsLoaded"
          striped-rows
          table-style="min-width: 80rem"
          paginator
          :rows="6"
          :rows-per-page-options="[6, 10, 20]"
      >
        <pv-column field="timestamp" :header="t('alerts.list.timestamp')" sortable>
          <template #body="slotProps">
            {{ formatDate(slotProps.data.createdAt ?? slotProps.data.timestamp ?? slotProps.data.ts) }}
          </template>
        </pv-column>

        <pv-column field="equipmentId" :header="t('alerts.list.equipment')" sortable>
          <template #body="slotProps">
            <span class="font-semibold text-gray-800">
              {{ slotProps.data.equipmentId }}
            </span>
          </template>
        </pv-column>

        <pv-column field="siteId" :header="t('alerts.list.site')" sortable />

        <pv-column field="type" :header="t('alerts.list.type')">
          <template #body="slotProps">
            <span
                class="px-3 py-1 rounded-full text-white font-semibold text-sm capitalize"
                :class="{
                'bg-orange-500': slotProps.data.type === 'highTemperature',
                'bg-gray-500': slotProps.data.type === 'powerLoss',
                'bg-blue-500': slotProps.data.type === 'sensorOffline'
              }"
            >
              {{ t(`alerts.types.${slotProps.data.type}`) }}
            </span>
          </template>
        </pv-column>

        <pv-column field="tenantId" :header="t('alerts.list.tenant')" sortable />

        <pv-column :header="t('alerts.list.actions')">
          <template #body="slotProps">
            <div class="flex gap-2">
              <RouterLink
                  :to="{ name: 'equipment-detail', params: { equipmentId: slotProps.data.equipmentId } }"
              >
                <pv-button
                    :label="t('alerts.list.viewEquipment')"
                    class="!bg-blue-600 hover:!bg-blue-700 text-white !py-2 !px-4 rounded-lg"
                />
              </RouterLink>

              <pv-button
                  icon="pi pi-check"
                  :label="t('alerts.list.acknowledge', 'Acknowledge')"
                  class="!bg-yellow-500 hover:!bg-yellow-600 text-white !py-2 !px-3 rounded-lg"
                  @click="confirmAcknowledge(slotProps.data)"
              />
            </div>
          </template>
        </pv-column>
      </pv-data-table>

      <div v-if="errors.length" class="text-red-500 mt-3">
        {{ t("errors.occurred") }}: {{ errors.map(e => e.message).join(", ") }}
      </div>
    </div>

    <pv-confirm-dialog />
    <pv-toast />
  </section>
</template>
