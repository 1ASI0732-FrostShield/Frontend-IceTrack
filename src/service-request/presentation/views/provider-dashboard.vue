<script setup>
/**
 * @file provider-dashboard.vue
 * @description This component displays the provider's dashboard, including KPIs and pending service requests.
 * @author Kenyi Ramirez
 */
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ServiceRequestsApi} from "@/service-request/infrastructure/service-requests-api.js";
import { useAuthStore } from '@/iam/application/auth.store.js';
import { ServiceRequestAssembler} from "@/service-request/infrastructure/service-request.assembler.js";
import { IamApi } from "@/iam/infrastructure/iam.api.js";
import { TechniciansApi } from '@/technician-management/infrastructure/technicians.api.js';
import { AssetsManagementApi } from "@/assets-management/infrastructure/assets-management-api.js";
import { MonitoringApi } from "@/monitoring/infrastructure/monitoring-api.js";

const { t } = useI18n();
const router = useRouter();
const serviceRequestApi = new ServiceRequestsApi();
const techniciansApi = new TechniciansApi();
const iamApi = new IamApi();
const authStore = useAuthStore();
const assetsManagementApi = new AssetsManagementApi();
const monitoringApi = new MonitoringApi();

/** @type {import('vue').Ref<boolean>} */
const loading = ref(false);
/** @type {import('vue').Ref<string|null>} */
const error = ref(null);
/** @type {import('vue').Ref<Array<object>>} */
const pendingRequests = ref([]);
/** @type {import('vue').Ref<object>} */
const kpis = ref({
  pending: 0,
  active: 0,
  technicians: 0,
});

/**
 * Computed property for the current provider's ID.
 * @type {import('vue').ComputedRef<number>}
 */
const currentProviderId = computed(() => authStore.currentUserId);

/**
 * Fetches data for the dashboard, including service requests and technicians.
 * @async
 * @function fetchData
 */
const fetchData = async () => {
  if (!currentProviderId.value) return;
  loading.value = true;
  error.value = null;
  try {
    const [requestsRes, techsRes, sitesRes, equipmentsRes] = await Promise.all([
      serviceRequestApi.getRequestsForProviderQuery(currentProviderId.value),
      techniciansApi.getTechniciansByProvider(currentProviderId.value),
      assetsManagementApi.getSites(),
      monitoringApi.getEquipment()
    ]);

    const allRequests = requestsRes.data;
    const context = { sites: sitesRes.data, equipments: equipmentsRes.data };

    pendingRequests.value = allRequests
        .filter(r => r.status === 'pending')
        .map(r => ServiceRequestAssembler.toEntityFromResource(r, context));

    kpis.value.pending = pendingRequests.value.length;
    kpis.value.active = allRequests.filter(r => ['accepted', 'inProgress'].includes(r.status)).length;
    kpis.value.technicians = techsRes.data.length;

  } catch (e) {
    error.value = 'Failed to load dashboard data.';
    console.error(e);
  } finally {
    loading.value = false;
  }
};

/**
 * Handles accepting a service request.
 * @param {number} requestId - The ID of the request to accept.
 * @async
 * @function handleAccept
 */
const handleAccept = async (requestId) => {
  await serviceRequestApi.sendAcceptRequestCommand(requestId);
  await fetchData();
};

/**
 * Handles rejecting a service request.
 * @param {number} requestId - The ID of the request to reject.
 * @async
 * @function handleReject
 */
const handleReject = async (requestId) => {
  await serviceRequestApi.sendRejectRequestCommand(requestId);
  await fetchData();
};

/**
 * Navigates to the provider's service list.
 * @function navigateToList
 */
const navigateToList = () => {
  router.push({ name: 'provider-services-list' });
};

onMounted(fetchData);
</script>

<template>
  <div class="p-4">
    <!-- Header -->
    <h1 class="text-3xl font-bold mb-4">{{ t('provider.dashboard.title') }}</h1>

    <!-- KPI Cards -->
    <div class="grid mb-4">
      <div class="col-12 md:col-6 lg:col-3">
        <pv-card class="bg-blue-100">
          <template #title><span class="text-blue-900">{{ t('provider.dashboard.new-requests') }}</span></template>
          <template #content>
            <div class="flex justify-content-between align-items-center">
              <i class="pi pi-inbox text-blue-500 text-5xl"></i>
              <span class="text-5xl font-bold text-blue-900">{{ kpis.pending }}</span>
            </div>
          </template>
        </pv-card>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <pv-card class="bg-orange-100">
          <template #title><span class="text-orange-900">{{ t('provider.dashboard.active-services') }}</span></template>
          <template #content>
            <div class="flex justify-content-between align-items-center">
              <i class="pi pi-spin pi-cog text-orange-500 text-5xl"></i>
              <span class="text-5xl font-bold text-orange-900">{{ kpis.active }}</span>
            </div>
          </template>
        </pv-card>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <pv-card class="bg-teal-100">
          <template #title><span class="text-teal-900">{{ t('provider.dashboard.my-technicians') }}</span></template>
          <template #content>
            <div class="flex justify-content-between align-items-center">
              <i class="pi pi-users text-teal-500 text-5xl"></i>
              <span class="text-5xl font-bold text-teal-900">{{ kpis.technicians }}</span>
            </div>
          </template>
        </pv-card>
      </div>
      <div class="col-12 md:col-6 lg:col-3">
        <pv-card class="bg-purple-100">
          <template #title><span class="text-purple-900">{{ t('provider.dashboard.all-services') }}</span></template>
          <template #content>
            <div class="flex flex-column align-items-start">
              <p class="text-color-secondary m-0">{{ t('provider.dashboard.all-services-description') }}</p>
              <pv-button :label="t('provider.dashboard.view-all-services')" icon="pi pi-arrow-right" class="p-button-text mt-2" @click="navigateToList" />
            </div>
          </template>
        </pv-card>
      </div>
    </div>

    <!-- Pending Requests Table -->
    <pv-card>
      <template #title>
        <div class="flex justify-content-between align-items-center">
          <h2 class="text-2xl m-0">{{ t('provider.dashboard.pending-requests') }}</h2>
          <!-- Reload Button -->
          <pv-button icon="pi pi-refresh" text rounded @click="fetchData" v-tooltip.left="t('provider.dashboard.refresh-list')"/>
        </div>
      </template>
      <template #content>
        <pv-data-table :value="pendingRequests" :loading="loading" responsive-layout="scroll">
          <!-- Id -->
          <pv-column field="id" :header="t('provider.dashboard.id')" sortable style="width: 10%"></pv-column>

          <!-- Description -->
          <pv-column field="description" :header="t('provider.dashboard.description')" style="width: 40%"></pv-column>

          <!-- Site Name -->
          <pv-column field="siteName" :header="t('provider.dashboard.site')" sortable style="width: 20%"></pv-column>

          <!-- Equipment Name -->
          <pv-column field="equipmentName" :header="t('services.requests.equipment')" sortable />

          <!-- Priority -->
          <pv-column field="priority" :header="t('provider.dashboard.priority')" sortable style="width: 15%">
            <template #body="{ data }">
              <pv-tag :severity="data.priority === 'high' ? 'danger' : (data.priority === 'medium' ? 'warning' : 'info')" :value="data.priority"></pv-tag>
            </template>
          </pv-column>

          <!-- Status -->
          <pv-column :header="t('provider.dashboard.actions')" style="width: 15%">
            <template #body="{ data }">
              <!-- Succes -->
              <pv-button icon="pi pi-check" class="p-button-success mr-2" @click="handleAccept(data.id)" v-tooltip.top="t('provider.dashboard.accept')"/>

              <!-- Reject -->
              <pv-button icon="pi pi-times" class="p-button-danger" @click="handleReject(data.id)" v-tooltip.top="t('provider.dashboard.reject')"/>
            </template>
          </pv-column>
          <template #empty>
            {{ t('provider.dashboard.no-pending-requests') }}
          </template>
        </pv-data-table>
      </template>
    </pv-card>
  </div>
</template>
