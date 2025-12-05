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
const { fetchAlerts, acknowledgeAlert } = store;

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
  if (!alert?.id) {
    toast.add({
      severity: "error",
      summary: t("alerts.errors.invalidId"),
      life: 3000,
    });
    return;
  }

  confirm.require({
    message: t("alerts.confirm.message"),
    header: t("alerts.confirm.header"),
    icon: "pi pi-check-circle",
    acceptLabel: t("alerts.actions.acknowledge"),
    rejectLabel: t("common.cancel"),

    accept: async () => {
      try {
        await acknowledgeAlert(alert.id);
        alert.status = "acknowledged";

        toast.add({
          severity: "success",
          summary: t("alerts.success.acknowledged"),
          life: 2000
        });
      } catch (err) {
        toast.add({
          severity: "error",
          summary: t("alerts.errors.acknowledge"),
          life: 3000
        });
      }
    },
  });
}

function confirmDelete(alert) {
  if (!alert?.id) {
    toast.add({
      severity: "error",
      summary: t("alerts.errors.invalidId"),
      life: 3000,
    });
    return;
  }

  confirm.require({
    message: t("alerts.confirm.deleteMessage"),
    header: t("alerts.confirm.deleteHeader"),
    icon: "pi pi-exclamation-triangle",
    acceptLabel: t("alerts.actions.delete"),
    rejectLabel: t("common.cancel"),

    accept: async () => {
      try {
        await store.deleteAlert(alert.id);

        toast.add({
          severity: "success",
          summary: t("alerts.success.deleted"),
          life: 2000
        });

      } catch (err) {
        toast.add({
          severity: "error",
          summary: t("alerts.errors.delete"),
          life: 3000
        });
      }
    }
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

    <!-- Filters -->
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

    <!-- Alerts Table -->
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
        <!-- Date -->
        <pv-column :header="t('alerts.list.timestamp')" sortable>
          <template #body="{ data }">
            {{ formatDate(data.createdAt ?? data.timestamp ?? data.ts) }}
          </template>
        </pv-column>

        <!-- Equipment -->
        <pv-column field="equipmentId" :header="t('alerts.list.equipment')" sortable>
          <template #body="{ data }">
            <span class="font-semibold text-gray-800">{{ data.equipmentId }}</span>
          </template>
        </pv-column>

        <!-- Site -->
        <pv-column field="siteId" :header="t('alerts.list.site')" sortable />

        <!-- Alert Type -->
        <pv-column field="type" :header="t('alerts.list.type')">
          <template #body="{ data }">
            <span
                class="px-2 py-1 rounded-md font-medium text-sm capitalize border"
                :class="{
              'bg-orange-50 text-orange-700 border-orange-300': data.type === 'highTemperature',
              'bg-gray-100 text-gray-700 border-gray-400': data.type === 'powerLoss',
              'bg-blue-50 text-blue-700 border-blue-300': data.type === 'sensorOffline'
            }"
            >
                {{ t(`alerts.types.${data.type}`) }}
            </span>
          </template>
        </pv-column>

        <pv-column field="tenantId" :header="t('alerts.list.tenant')" sortable />

        <!-- Alert Status -->
        <pv-column :header="t('alerts.list.status')">
          <template #body="{ data }">
    <span
        class="px-3 py-1 rounded-full font-semibold text-sm"
        :class="{
        'bg-yellow-500 text-white': data.status === 'open',
        'bg-green-500 text-white': data.status === 'acknowledged',
        'bg-gray-500 text-white': data.status === 'closed',
        'bg-blue-500 text-white': data.status === 'resolved'
      }"
    >
      {{ t(`alerts.status.${data.status}`) }}
    </span>
          </template>
        </pv-column>

        <!-- Actions -->
        <pv-column :header="t('alerts.list.actions')">
          <template #body="{ data }">
            <div class="flex gap-2">
              <RouterLink
                  :to="{ name: 'equipment-detail', params: { equipmentId: data.equipmentId } }"
              >
                <pv-button
                    :label="t('alerts.actions.viewEquipment')"
                    class="!bg-blue-600 hover:!bg-blue-700 text-white !py-2 !px-4 rounded-lg"
                />
              </RouterLink>

              <pv-button
                  icon="pi pi-check"
                  :label="t('alerts.actions.acknowledge')"
                  class="!bg-yellow-500 hover:!bg-yellow-600 text-white !py-2 !px-3 rounded-lg"
                  :disabled="data.status === 'acknowledged'"
                  @click="confirmAcknowledge(data)"
              />

              <pv-button
                  icon="pi pi-trash"
                  :label="t('alerts.actions.delete')"
                  class="!bg-red-500 hover:!bg-red-600 text-white !py-2 !px-3 rounded-lg"
                  @click="confirmDelete(data)"
              />
            </div>
          </template>
        </pv-column>
      </pv-data-table>

      <div v-if="errors.length" class="text-red-500 mt-3">
        {{ t("alerts.errors.generic") }}:
        {{ errors.map(e => e.message).join(", ") }}
      </div>
    </div>

    <pv-confirm-dialog />
    <pv-toast />
  </section>
</template>