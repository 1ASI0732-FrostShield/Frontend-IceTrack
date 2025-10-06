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
  if (!status) {
    return t('common.all');
  }
  return t(`services.status.${status}`);
}

const typeTranslation = (type) => {
  if (!type) {
    return t('common.all');
  }
  return t(`service-requests.types.${type}`);
}


const navigateToNew = () => {
  router.push({ name: 'service-requests-new' });
};

const openTrackDrawer = (request) => {
  console.log(`Abriendo seguimiento para SR ID: ${request.id}`);
  alert(`Seguimiento de ${request.id}: Estado actual: ${statusTranslation(request.status)}. Técnico: ${request.technicianName || t('services.status.pending')}`);
};

const openReport = (request) => {
  if (request.reportUrl) {
    console.log(`Abriendo reporte: ${request.reportUrl}`);
    window.open(request.reportUrl, '_blank');
  }
};

const confirmCancel = (request) => {
  confirm.require({
    message: t('services.requests.confirm-cancel', { id: request.id }),
    header: t('services.requests.cancel-header'),
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
      <h1 class="text-3xl font-bold">{{ t('services.requests.my-requests') }}</h1>
      <pv-button
          :label="t('services.requests.new')"
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
          {{ typeTranslation(slotProps.option) }}
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

      <pv-column field="id" :header="t('services.requests.id')" sortable style="width: 100px;"/>

      <pv-column field="createdAt" :header="t('services.requests.date')" sortable>
        <template #body="slotProps">
          {{ new Date(slotProps.data.createdAt).toLocaleDateString() }}
        </template>
      </pv-column>
      <pv-column field="equipmentName" :header="t('services.requests.equipment')" sortable/>
      <pv-column field="siteName" :header="t('services.requests.site')" sortable/>

      <pv-column field="type" :header="t('services.requests.type')">
        <template #body="slotProps">
          <pv-tag :value="typeTranslation(slotProps.data.type)"
                  :severity="slotProps.data.type === 'corrective' ? 'danger' : 'warning'" />
        </template>
      </pv-column>

      <pv-column field="status" :header="t('services.requests.status')">
        <template #body="slotProps">
          <pv-tag :value="statusTranslation(slotProps.data.status)"
                  :severity="statusSeverity(slotProps.data.status)" />
        </template>
      </pv-column>

      <pv-column :header="t('services.requests.actions')">
        <template #body="slotProps">
          <pv-button
              icon="pi pi-search"
              :label="t('services.requests.track')"
              text rounded
              severity="info"
              v-tooltip.top="t('services.requests.track-tooltip')"
              @click="openTrackDrawer(slotProps.data)"
          />
          <pv-button
              v-if="slotProps.data.status === 'done'"
              icon="pi pi-file-pdf"
              :label="t('services.requests.view-report')"
              text rounded
              severity="help"
              v-tooltip.top="t('services.requests.report-tooltip')"
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
      {{ t('common.error-occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>
    <pv-confirm-dialog/>
  </div>
</template>

<style scoped>
</style>