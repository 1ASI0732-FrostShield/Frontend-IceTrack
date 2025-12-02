<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ServiceRequestsApi} from "@/service-request/infrastructure/service-requests-api.js";
import { useAuthStore } from '@/iam/application/auth.store.js';
import { ServiceRequestAssembler} from "@/service-request/infrastructure/service-request.assembler.js";
import { IamApi } from "@/iam/infrastructure/iam.api.js";
import { TechniciansApi } from '@/technician-management/infrastructure/technicians.api.js';

const router = useRouter();
const serviceRequestApi = new ServiceRequestsApi();
const techniciansApi = new TechniciansApi();
const iamApi = new IamApi();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref(null);
const pendingRequests = ref([]);
const kpis = ref({
  pending: 0,
  active: 0,
  technicians: 0,
});

const currentProviderId = computed(() => authStore.currentUserId);

const fetchData = async () => {
  if (!currentProviderId.value) return;
  loading.value = true;
  error.value = null;
  try {
    const [requestsRes, techsRes] = await Promise.all([
      serviceRequestApi.getRequestsForProviderQuery(currentProviderId.value),
      techniciansApi.getTechniciansByProvider(currentProviderId.value),
      // iamApi.http.get('/sites') // Not implemented yet
    ]);

    const allRequests = requestsRes.data;
    const context = { /* sites: sitesRes.data */ };

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

const handleAccept = async (requestId) => {
  await serviceRequestApi.sendAcceptRequestCommand(requestId);
  await fetchData();
};

const handleReject = async (requestId) => {
  await serviceRequestApi.sendRejectRequestCommand(requestId);
  await fetchData();
};

const navigateToList = () => {
  router.push({ name: 'provider-infrastructure-list' });
};

onMounted(fetchData);
</script>

<template>
  <div class="p-4">
    <!-- Header -->
    <h1 class="text-3xl font-bold mb-4">Dashboard</h1>

    <!-- KPI Cards -->
    <div class="grid mb-4">
      <div class="col-12 md:col-6 lg:col-3">
        <pv-card class="bg-blue-100">
          <template #title><span class="text-blue-900">New Requests</span></template>
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
          <template #title><span class="text-orange-900">Active Services</span></template>
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
          <template #title><span class="text-teal-900">My Technicians</span></template>
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
          <template #title><span class="text-purple-900">All Services</span></template>
          <template #content>
            <div class="flex flex-column align-items-start">
              <p class="text-color-secondary m-0">Go to the complete list of your services.</p>
              <pv-button label="View All Services" icon="pi pi-arrow-right" class="p-button-text mt-2" @click="navigateToList" />
            </div>
          </template>
        </pv-card>
      </div>
    </div>

    <!-- Pending Requests Table -->
    <pv-card>
      <template #title>
        <div class="flex justify-content-between align-items-center">
          <h2 class="text-2xl m-0">Pending Requests</h2>
          <pv-button icon="pi pi-refresh" text rounded @click="fetchData" v-tooltip.left="'Refresh List'"/>
        </div>
      </template>
      <template #content>
        <pv-data-table :value="pendingRequests" :loading="loading" responsive-layout="scroll">
          <pv-column field="id" header="ID" sortable style="width: 10%"></pv-column>
          <pv-column field="description" header="Description" style="width: 40%"></pv-column>
          <pv-column field="siteName" header="Site" sortable style="width: 20%"></pv-column>
          <pv-column field="priority" header="Priority" sortable style="width: 15%">
            <template #body="{ data }">
              <pv-tag :severity="data.priority === 'high' ? 'danger' : (data.priority === 'medium' ? 'warning' : 'info')" :value="data.priority"></pv-tag>
            </template>
          </pv-column>
          <pv-column header="Actions" style="width: 15%">
            <template #body="{ data }">
              <pv-button icon="pi pi-check" class="p-button-success mr-2" @click="handleAccept(data.id)" v-tooltip.top="'Accept'"/>
              <pv-button icon="pi pi-times" class="p-button-danger" @click="handleReject(data.id)" v-tooltip.top="'Reject'"/>
            </template>
          </pv-column>
          <template #empty>
            No pending requests found.
          </template>
        </pv-data-table>
      </template>
    </pv-card>
  </div>
</template>
