<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/iam/application/auth.store.js';
import { ServiceRequestsApi} from "@/service-request/infrastructure/service-requests-api.js";
import { ServiceRequestAssembler} from "@/service-request/infrastructure/service-request.assembler.js";
import { IamApi } from "@/iam/infrastructure/iam.api.js";

const router = useRouter();
const authStore = useAuthStore();
const serviceRequestApi = new ServiceRequestsApi();
const iamApi = new IamApi();

const loading = ref(false);
const requests = ref([]);
const filters = ref({ status: '', clientName: '' });

const currentProviderId = computed(() => authStore.currentUserId);

const fetchData = async () => {
  if (!currentProviderId.value) return;
  loading.value = true;
  try {
    const [requestsRes, usersRes] = await Promise.all([
      serviceRequestApi.getRequestsForProviderQuery(currentProviderId.value),
      // iamApi.http.get('/sites'),
      iamApi.http.get('/users')
    ]);
    const context = { users: usersRes.data /* sites: sitesRes.data */ };
    requests.value = ServiceRequestAssembler.toEntitiesFromResponse(requestsRes.data, context);
  } catch (error) {
    console.error("Failed to fetch service requests:", error);
  } finally {
    loading.value = false;
  }
};

const filteredRequests = computed(() => {
  let list = [...requests.value];
  list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  list = list.map((req, index) => ({ ...req, orderNumber: index + 1 }));

  if (filters.value.status) {
    list = list.filter(req => req.status === filters.value.status);
  }
  if (filters.value.clientName) {
    list = list.filter(req =>
        req.requesterName.toLowerCase().includes(filters.value.clientName.toLowerCase())
    );
  }
  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
    <div class="bg-white p-4 rounded-xl shadow-md mb-6 flex flex-wrap gap-4 items-center">
      <div class="flex items-center gap-2">
        <label for="status-filter" class="font-semibold">Status:</label>
        <pv-select-button id="status-filter" v-model="filters.status"
                          :options="['', 'pending', 'accepted', 'inProgress', 'completed', 'canceled', 'rejected']"
                          :allowEmpty="true">
          <template #option="slotProps">{{ slotProps.option || 'All' }}</template>
        </pv-select-button>
      </div>
      <div class="flex items-center gap-2">
        <label for="client-search" class="font-semibold">Client:</label>
        <pv-icon-field iconPosition="left">
          <pv-input-icon class="pi pi-search" />
          <pv-input-text id="client-search" v-model="filters.clientName" placeholder="Search by client name" />
        </pv-icon-field>
      </div>
    </div>

    <!-- Data Table -->
    <pv-data-table :value="filteredRequests" :loading="loading" paginator :rows="10" responsive-layout="scroll">
      <pv-column field="orderNumber" header="Order #" sortable />
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
