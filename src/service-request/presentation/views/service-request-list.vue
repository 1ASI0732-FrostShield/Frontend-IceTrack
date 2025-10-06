<script setup>
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { onMounted, computed, ref } from "vue";
import { useConfirm } from "primevue/useconfirm";
import useServiceRequestsStore from "../../application/service-requests.store.js";

const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const store = useServiceRequestsStore();
const { requests, requestsLoaded, errors, fetchServiceRequests, cancelRequest } = store;

const currentUserId = ref('u4');

onMounted(() => {
  if (!requestsLoaded.value) {
    fetchServiceRequests(currentUserId.value);
  }
});

const filters = ref({
  status: '',
  type: ''
});

const filteredRequests = computed(() => {
  let list = Array.isArray(requests.value) ? requests.value : [];

  if (filters.value.status) {
    list = list.filter(req => req.status === filters.value.status);
  }
  if (filters.value.type) {
    list = list.filter(req => req.type === filters.value.type);
  }

  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});



// --- ESTILOS Y ACCIONES ---

const statusSeverity = (status) => {
  switch (status) {
    case 'pending': return 'danger';
    case 'assigned': return 'warning';
    case 'scheduled': return 'info';
    case 'inProgress': return 'primary';
    case 'done': return 'success';
    case 'canceled': return 'secondary';
    default: return 'secondary';
  }
};

const statusTranslation = (status) => {
  const statusMap = {
    'pending': 'Pendiente',
    'assigned': 'Asignado',
    'scheduled': 'Programado',
    'inProgress': 'En Progreso',
    'done': 'Completado',
    'canceled': 'Cancelado'
  };
  return statusMap[status] || status;
}

const navigateToNew = () => {
  router.push({ name: 'service-requests-new' });
};

const openTrackDrawer = (request) => {
  console.log(`Abriendo seguimiento para SR ID: ${request.id}`);
  alert(`Seguimiento de ${request.id}: Estado actual: ${statusTranslation(request.status)}. Técnico: ${request.technicianName || 'Pendiente'}`);
};

const openReport = (request) => {
  if (request.reportUrl) {
    console.log(`Abriendo reporte: ${request.reportUrl}`);
    window.open(request.reportUrl, '_blank');
  }
};

const confirmCancel = (request) => {
  confirm.require({
    message: t('service-requests.confirm-cancel', { id: request.id }),
    header: t('service-requests.cancel-header'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      cancelRequest(request.id);
    },
  });
};
</script>

<template>
  <div class="p-4">
    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="text-3xl font-bold">{{ t('service-requests.my-requests') }}</h1>
      <pv-button
          :label="t('service-requests.new-request')"
          icon="pi pi-plus"
          severity="success"
          @click="navigateToNew"
      />
    </div>

    <div class="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-wrap gap-3 items-center">
      <span class="text-sm font-semibold">{{ t('common.filter-by') }}:</span>
      <pv-select-button
          v-model="filters.status"
          :options="['', 'pending', 'assigned', 'inProgress', 'done']"
          optionLabel="status"
          :allowEmpty="true"
      >
        <template #option="slotProps">
          {{ statusTranslation(slotProps.option) }}
        </template>
      </pv-select-button>

      <pv-select-button
          v-model="filters.type"
          :options="['', 'corrective', 'preventive']"
          optionLabel="type"
          :allowEmpty="true"
          class="ml-3"
      >
        <template #option="slotProps">
          {{ slotProps.option === 'corrective' ? 'Correctivo' : 'Preventivo' }}
        </template>
      </pv-select-button>
    </div>

    <pv-data-table
        :value="filteredRequests"
        :loading="!requestsLoaded"
        striped-rows
        :rows="10"
        paginator
        table-style="min-width: 50rem">

      <pv-column field="id" :header="t('service-requests.id')" sortable style="width: 100px;"/>
      <pv-column field="createdAt" :header="t('service-requests.date')" sortable>
        <template #body="slotProps">
          {{ new Date(slotProps.data.createdAt).toLocaleDateString() }}
        </template>
      </pv-column>
      <pv-column field="equipmentName" :header="t('service-requests.equipment')" sortable/>
      <pv-column field="siteName" :header="t('service-requests.site')" sortable/>

      <pv-column field="type" :header="t('service-requests.type')">
        <template #body="slotProps">
          <pv-tag :value="slotProps.data.type === 'corrective' ? 'Correctivo' : 'Preventivo'"
                  :severity="slotProps.data.type === 'corrective' ? 'danger' : 'warning'" />
        </template>
      </pv-column>

      <pv-column field="status" :header="t('service-requests.status')" sortable>
        <template #body="slotProps">
          <pv-tag :value="statusTranslation(slotProps.data.status)"
                  :severity="statusSeverity(slotProps.data.status)" />
        </template>
      </pv-column>

      <pv-column :header="t('service-requests.actions')">
        <template #body="slotProps">
          <pv-button
              icon="pi pi-search"
              :label="t('service-requests.track')"
              text rounded
              severity="info"
              v-tooltip.top="t('service-requests.track-tooltip')"
              @click="openTrackDrawer(slotProps.data)"
          />
          <pv-button
              v-if="slotProps.data.status === 'done'"
              icon="pi pi-file-pdf"
              :label="t('service-requests.view-report')"
              text rounded
              severity="help"
              v-tooltip.top="t('service-requests.report-tooltip')"
              @click="openReport(slotProps.data)"
          />
          <pv-button
              v-if="slotProps.data.status === 'pending'"
              icon="pi pi-times"
              :label="t('common.cancel')"
              text rounded
              severity="danger"
              v-tooltip.top="t('common.cancel-tooltip')"
              @click="confirmCancel(slotProps.data)"
          />
        </template>
      </pv-column>
    </pv-data-table>

    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>
    <pv-confirm-dialog/>
  </div>
</template>

<style scoped>
</style>