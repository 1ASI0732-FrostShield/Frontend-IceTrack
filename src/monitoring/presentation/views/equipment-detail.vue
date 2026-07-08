<script setup>

import { useI18n } from '@/i18n.js'
import { onMounted, ref } from "vue";
import { storeToRefs } from 'pinia';
import { useConfirm } from "primevue/useconfirm";
import useMonitoringStore from "@/monitoring/application/monitoring.store.js";
import useAssetsManagementStore from "@/assets-management/application/assets-management.store.js";
import { useRouter } from 'vue-router';
import { useReportPdf } from '@/composables/useReportPdf.js';
import { ServiceRequestsApi } from "@/service-request/infrastructure/service-requests-api.js";
import { MonitoringApi } from "@/monitoring/infrastructure/monitoring-api.js";
const { t } = useI18n();
const store = useMonitoringStore();
const assetsStore = useAssetsManagementStore();
const { equipments, equipmentsLoaded, errors } = storeToRefs(store);
const { sites, sitesLoaded } = storeToRefs(assetsStore);
const { fetchSites } = assetsStore;
const { generateEquipmentReport, generateHistoricalReport } = useReportPdf();
const { fetchEquipments, updateEquipment, deleteEquipment } = store;
const confirm = useConfirm();
const serverError = ref(null);
const displayEditDialog = ref(false);
const selectedEquipment = ref(null);
const router = useRouter();
const serviceRequestsApi = new ServiceRequestsApi();
const monitoringApi = new MonitoringApi();
const editForm = ref({
  id: null,
  name: '',
  model: '',
  type: '',
  serial: '',
  status: '',
  online: false,
  siteId: null
});

const getSiteName = (siteId) => {
  const site = sites.value.find(s => s.id === siteId);
  return site ? site.name : siteId;
};

const downloadingPdf = ref(null);
const downloadingHistoryPdf = ref(null);

async function downloadEquipmentPdf(equipment) {
  downloadingPdf.value = equipment.id;
  const siteName = getSiteName(equipment.siteId);

  let recentInterventions = []
  let observations = ''
  let recommendations = ''

  try {
    const requestsRes = await serviceRequestsApi.http.get('/service-requests')
    const allRequests = Array.isArray(requestsRes.data) ? requestsRes.data : []
    const equipmentRequests = allRequests.filter(r => r.equipmentId === equipment.id)

    for (const req of equipmentRequests) {
      const ivRes = await serviceRequestsApi.getInterventionsByRequestQuery(req.id)
      const ivs = Array.isArray(ivRes.data) ? ivRes.data : []
      ivs.forEach(iv => {
        recentInterventions.push({
          ...iv,
          startTime: iv.startTime || req.createdAt,
          technicianName: req.technicianName || null
        })
      })
    }

    recentInterventions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    recentInterventions = recentInterventions.slice(0, 5)

    if (equipment.status === 'MAINTENANCE') {
      observations = 'Durante las últimas revisiones se identificaron componentes con desgaste progresivo que motivaron la puesta en mantenimiento del equipo. Se recomienda llevar un registro detallado de las piezas reemplazadas y los ciclos de operación para anticipar futuras intervenciones.'
      recommendations = 'Programar mantenimiento preventivo cada 3 meses. Verificar niveles de refrigerante, estado de filtros, presión de trabajo y conexiones eléctricas. Realizar limpieza general de condensadores y evaporadores.'
    } else if (equipment.status === 'REPAIR') {
      observations = 'El equipo se encuentra en proceso de reparación debido a fallas operativas detectadas. Se están evaluando los componentes críticos para determinar el alcance de las reparaciones necesarias.'
      recommendations = 'Una vez finalizada la reparación, se recomienda realizar una prueba de funcionamiento continua de 24 horas. Establecer un plan de monitoreo intensivo durante la primera semana posterior a la puesta en marcha.'
    } else if (equipment.status === 'ACTIVE') {
      observations = 'El equipo opera dentro de los parámetros normales. No se detectaron anomalías significativas durante las últimas inspecciones.'
      recommendations = 'Mantener el plan de mantenimiento preventivo vigente. Se sugiere realizar inspecciones visuales mensuales y revisiones técnicas trimestrales para asegurar la continuidad operativa.'
    } else if (equipment.status === 'OFF') {
      observations = 'El equipo se encuentra apagado. No se ha registrado actividad operativa reciente.'
      recommendations = 'Previo a una nueva puesta en marcha, realizar una revisión completa del estado de todos los componentes. Verificar que no haya acumulación de humedad o corrosión en las conexiones eléctricas.'
    }
  } catch (err) {
    console.warn('[PDF] No se pudieron obtener intervenciones relacionadas:', err)
  }

  await generateEquipmentReport(equipment, siteName, recentInterventions, observations, recommendations)
  downloadingPdf.value = null;
}

async function downloadHistoryPdf(equipment) {
  downloadingHistoryPdf.value = equipment.id;
  const siteName = getSiteName(equipment.siteId);

  let relatedRequests = []
  const techNameMap = {}

  try {
    const res = await serviceRequestsApi.getMaintenanceHistoryQuery(equipment.id)
    const data = res.data
    relatedRequests = Array.isArray(data.serviceRequests) ? data.serviceRequests : []

    data.serviceRequests?.forEach(sr => {
      if (sr.technicianName) techNameMap[sr.technicianId] = sr.technicianName
      if (sr.providerName) techNameMap[`provider_${sr.assignedTo}`] = sr.providerName
    })
    data.interventions?.forEach(iv => {
      if (iv.technicianName) techNameMap[iv.technicianId] = iv.technicianName
    })
  } catch (err) {
    console.warn('[PDF] No se pudieron obtener solicitudes relacionadas:', err)
  }

  const allTechnicians = Object.entries(techNameMap).map(([key, name]) => {
    const id = key.startsWith('provider_') ? parseInt(key.replace('provider_', '')) : parseInt(key)
    return { id, name }
  })

  await generateHistoricalReport(equipment, siteName, relatedRequests, allTechnicians)
  downloadingHistoryPdf.value = null;
}

onMounted(() => {
  if (!equipmentsLoaded.value) fetchEquipments();
  if (!sitesLoaded.value) fetchSites();
});

const openEditDialog = (equipment) => {
  serverError.value = null;
  editForm.value = { ...equipment };
  displayEditDialog.value = true;
};

const saveEditEquipment = async () => {
  serverError.value = null;



  try {
    await updateEquipment(editForm.value);
    displayEditDialog.value = false;
    await fetchEquipments();
  } catch (error) {
    serverError.value = t('equipments.new.alert-create-error');
    console.error('Error updating equipment:', error);
  }
};

const confirmDelete = (equipment) => {
  if (!equipment.id) return;
  confirm.require({
    message: `¿Eliminar el equipo "${equipment.name}"?`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      await deleteEquipment(equipment);
      await fetchEquipments();
    }
  });
};

function showDetails(equipment) {
  selectedEquipment.value = equipment;
}

const formatDate = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(value));
};

const REMINDER_OPTIONS = [
  { label: 'No configurado', value: null },
  { label: 'Cada 7 d\u00edas', value: 7 },
  { label: 'Cada 15 d\u00edas', value: 15 },
  { label: 'Cada 30 d\u00edas', value: 30 }
];

async function handleReminderChange(equipmentId, intervalDays) {
  const eq = equipments.value.find(e => e.id === equipmentId)
  if (eq) {
    eq.reminderIntervalDays = intervalDays
    monitoringApi.updateReminderInterval(equipmentId, intervalDays)
  }
}

</script>

<template>
  <section class="p-4">
    <pv-confirm-dialog />

    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="text-3xl font-bold">{{ t('equipments.detail.title') }}</h1>

      <pv-button
          icon="pi pi-arrow-left"
          :label="t('common.back')"
          text
          severity="secondary"
          @click="router.back()"
      />
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
      <!-- Site / Local -->
      <pv-column field="siteId" :header="t('sites.list.name')" sortable>
        <template #body="{ data }">
          {{ getSiteName(data.siteId) }}
        </template>
      </pv-column>

      <!-- Modelo -->
      <pv-column field="model" :header="t('equipments.list.model')" sortable>
        <template #body="{ data }">
          {{ data.model || '—' }}
        </template>
      </pv-column>

      <!-- Created At -->
      <pv-column field="created" :header="t('equipments.detail.createdAt')">
        <template #body="{ data }">
          {{ formatDate(data.created) }}
        </template>
      </pv-column>

      <!-- Updated At -->
      <pv-column field="updated" :header="t('equipments.detail.updatedAt')">
        <template #body="{ data }">
          {{ formatDate(data.updated) }}
        </template>
      </pv-column>

      <!-- Recordatorio -->
      <pv-column :header="t('equipments.list.maintenanceInterval')" style="width: 160px">
        <template #body="{ data }">
          <pv-select
            :model-value="data.reminderIntervalDays ?? null"
            :options="REMINDER_OPTIONS"
            option-label="label"
            option-value="value"
            style="width: 100%"
            @update:model-value="handleReminderChange(data.id, $event)"
          />
        </template>
      </pv-column>

      <!-- PDF Report -->
      <pv-column :header="t('reports.actions.downloadPdf')" style="width: 100px">
        <template #body="{ data }">
          <pv-button
              icon="pi pi-file-pdf"
              text
              rounded
              severity="danger"
              v-tooltip.top="t('reports.actions.downloadPdf')"
              :loading="downloadingPdf === data.id"
              @click="downloadEquipmentPdf(data)"
          />
        </template>
      </pv-column>

      <!-- History PDF -->
      <pv-column :header="t('reports.types.equipmentHistory')" style="width: 100px">
        <template #body="{ data }">
          <pv-button
              icon="pi pi-history"
              text
              rounded
              severity="info"
              v-tooltip.top="t('reports.types.equipmentHistory')"
              :loading="downloadingHistoryPdf === data.id"
              @click="downloadHistoryPdf(data)"
          />
        </template>
      </pv-column>

      <!-- Botton Information -->
      <pv-column :header="t('equipments.controls.info')">
        <template #body="slotProps">
          <pv-button
              :label="t('common.more')"
              icon="pi pi-info-circle"
              iconPos="left"
              outlined
              rounded
              severity="info"
              @click="showDetails(slotProps.data)"
          />
        </template>
      </pv-column>

      <!-- Actions -->
      <pv-column :header="t('sites.detail.actions')">
        <template #body="{ data }">
          <div class="flex gap-2">
            <!-- Botton Edit -->
            <pv-button
                icon="pi pi-pencil"
                text
                rounded
                severity="warning"
                v-tooltip.top="t('common.edit')"
                @click="openEditDialog(data)"
            />

            <!-- Botton Delete -->
            <pv-button
                icon="pi pi-trash"
                text
                rounded
                severity="danger"
                v-tooltip.top="t('common.delete')"
                @click="confirmDelete(data)"
            />
          </div>
        </template>
      </pv-column>
    </pv-data-table>

    <!-- Diálogo edición -->
    <pv-dialog v-model:visible="displayEditDialog" header="Edit Equipment"
               :modal="true" class="p-fluid" style="width: 50vw">

      <div v-if="serverError"
           class="flex align-items-center gap-2 p-3 mb-3 border-round"
           style="background: #fdecea; border: 1px solid #f5c2c7; color: #842029; border-radius: 6px;">
        <i class="pi pi-exclamation-triangle" />
        <span>{{ serverError }}</span>
      </div>

      <div class="formgrid grid row-gap-3">
        <!-- Actualizar Model -->
        <div class="field col-12 md:col-6">
          <label class="block mb-2 font-medium">{{ t('equipments.new.model') }}</label>
          <pv-input-text v-model="editForm.model" class="w-full" disabled />
        </div>

        <!-- Actualizar Type -->
        <div class="field col-12 md:col-6">
          <label class="block mb-2 font-medium">{{ t('equipments.new.type') }}</label>
          <pv-input-text v-model="editForm.type" class="w-full" disabled />
        </div>

        <!-- Actualizar Serial -->
        <div class="field col-12 md:col-6">
          <label class="block mb-2 font-medium">{{ t('equipments.new.serial') }}</label>
          <pv-input-text v-model="editForm.serial" class="w-full" disabled />
        </div>

        <!-- Actualizar Status -->
        <div class="field col-12 md:col-6">
          <label class="block mb-2 font-medium">{{ t('equipments.new.status') }}</label>
          <pv-dropdown v-model="editForm.status"
                       :options="[
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Maintenance', value: 'MAINTENANCE' },
            { label: 'Repair', value: 'Repair' },
            { label: 'Off', value: 'OFF' }]"
                       option-label="label" option-value="value" class="w-full" />
        </div>

        <!-- Actualizar Online -->
        <div class="field col-12 md:col-6">
          <label class="block mb-2 font-medium">{{ t('equipments.new.online') }}</label>
          <pv-dropdown v-model="editForm.online"
                       :options="[{ label: 'Online', value: true }, { label: 'Offline', value: false }]"
                       option-label="label" option-value="value" class="w-full" />
        </div>
      </div>

      <template #footer>
        <pv-button label="Cancel" icon="pi pi-times"
                   class="p-button-text" @click="displayEditDialog = false" />
        <pv-button label="Save" icon="pi pi-check"
                   @click="saveEditEquipment" />
      </template>
    </pv-dialog>

    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>

    <!-- Show details -->
    <div v-if="selectedEquipment" class="flex flex-row justify-content-center gap-6 mt-3">
      <!-- Show Owner -->
      <div class="detail-card p-6 border text-center" style="width: 400px">
        <h2 class="detail-card__label">
          {{ t('equipments.controls.name') }}
        </h2>

        <h3 class="detail-card__value">
          {{ selectedEquipment.name }}
        </h3>
      </div>

      <!-- Show Online -->
      <div class="detail-card p-6 border text-center" style="width: 400px">
        <h2 class="detail-card__label">
          {{ t('equipments.controls.online') }}
        </h2>

        <h3 class="detail-card__value">
          {{ selectedEquipment.online }}
        </h3>
      </div>

      <!-- Show Serial -->
      <div class="detail-card p-6 border text-center" style="width: 400px">
        <h2 class="detail-card__label">
          {{ t('equipments.detail.serial') }}
        </h2>

        <h3 class="detail-card__value">
          {{ selectedEquipment.serial }}
        </h3>
      </div>

      <!-- Show Type -->
      <div class="detail-card p-6 border text-center" style="width: 400px">
        <h2 class="detail-card__label">
          {{ t('equipments.new.type') }}
        </h2>

        <h3 class="detail-card__value">
          {{ selectedEquipment.type }}
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

.detail-card {
  background: var(--app-surface-muted);
  box-shadow: var(--app-card-shadow);
  border-radius: 8px;
}

.detail-card__label {
  color: var(--app-primary);
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.detail-card__value {
  color: var(--app-text);
  font-weight: 700;
}

</style>
