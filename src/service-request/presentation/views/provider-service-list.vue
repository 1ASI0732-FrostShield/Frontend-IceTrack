<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/iam/application/auth.store.js';
import { ServiceRequestsApi } from '@/service-request/infrastructure/service-requests-api.js';
import { ServiceRequestAssembler } from '@/service-request/infrastructure/service-request.assembler.js';
import { IamApi } from "@/iam/infrastructure/iam.api.js";

const router = useRouter();
const authStore = useAuthStore();
const serviceApi = new ServiceRequestsApi();
const iamApi = new IamApi();

const loading = ref(false);
const requests = ref([]);
const filters = ref({ status: '' });

const currentProviderId = computed(() => authStore.currentUserId);

const fetchData = async () => {
  if (!currentProviderId.value) return;
  loading.value = true;
  try {
    const [requestsRes, sitesRes] = await Promise.all([
      serviceApi.http.get('/serviceRequests', { params: { assignedTo: currentProviderId.value } }),
      iamApi.http.get('/sites')
    ]);
    const context = { sites: sitesRes.data };
    requests.value = requestsRes.data.map(r => ServiceRequestAssembler.toEntityFromResource(r, context));
  } catch (error) {
    console.error("Failed to fetch service requests:", error);
  } finally {
    loading.value = false;
  }
};

const filteredRequests = computed(() => {
  if (!filters.value.status) return requests.value;
  return requests.value.filter(req => req.status === filters.value.status);
});

const navigateToDetail = (request) => {
  router.push({ name: 'service-request-detail', params: { requestId: request.id } });
};

const statusSeverity = (status) => ({
  pending: 'danger',
  accepted: 'warning',
  inProgress: 'info',
  completed: 'success',
  canceled: 'secondary',
  rejected: 'secondary'
}[status] || 'secondary');

onMounted(fetchData);
</script>

<template>
  <div class="p-4">
    <h1 class="text-3xl font-bold mb-4">My Service Requests</h1>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-xl shadow-md mb-6">
      <pv-select-button v-model="filters.status"
                        :options="['', 'pending', 'accepted', 'inProgress', 'completed', 'canceled', 'rejected']"
                        :allowEmpty="true">
        <template #option="slotProps">{{ slotProps.option || 'All' }}</template>
      </pv-select-button>
    </div>

    <!-- Data Table -->
    <pv-data-table :value="filteredRequests" :loading="loading" paginator :rows="10" responsive-layout="scroll">
      <pv-column field="id" header="ID" sortable />
      <pv-column field="requesterName" header="Client" sortable />
      <pv-column field="siteName" header="Site" sortable />
      <pv-column field="status" header="Status" sortable>
        <template #body="{ data }">
          <pv-tag :value="data.status" :severity="statusSeverity(data.status)" />
        </template>
      </pv-column>
      <pv-column header="Actions">
        <template #body="{ data }">
          <pv-button icon="pi pi-eye" text rounded severity="info" @click="navigateToDetail(data)" v-tooltip.top="'View Details'" />
        </template>
      </pv-column>
    </pv-data-table>
  </div>
</template>
