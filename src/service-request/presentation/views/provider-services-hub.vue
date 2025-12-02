<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ServiceRequestsApi} from "@/service-request/infrastructure/service-requests-api.js";
import { useAuthStore } from '@/iam/application/auth.store.js';

const router = useRouter();
const serviceApi = new ServiceRequestsApi();
const authStore = useAuthStore();
const currentProviderId = computed(() => authStore.currentUserId);

const counts = ref({
  pending: 0,
  accepted: 0,
  inProgress: 0,
  completed: 0,
  rejected: 0,
  canceled: 0,
});

onMounted(async () => {
  if (currentProviderId.value) {
    const response = await serviceApi.getRequestsForProviderQuery(currentProviderId.value);
    const allRequests = response.data;

    counts.value.pending = allRequests.filter(r => r.status === 'pending').length;
    counts.value.accepted = allRequests.filter(r => r.status === 'accepted').length;
    counts.value.inProgress = allRequests.filter(r => r.status === 'inProgress').length;
    counts.value.completed = allRequests.filter(r => r.status === 'completed').length;
    counts.value.rejected = allRequests.filter(r => r.status === 'rejected').length;
    counts.value.canceled = allRequests.filter(r => r.status === 'canceled').length;
  }
});

const navigate = (status) => {
  const routeNames = {
    'pending': 'provider-pending-infrastructure',
    'in-progress': 'provider-in-progress',
    'completed': 'provider-completed-infrastructure',
    'rejected-canceled': 'provider-rejected-canceled-infrastructure'
  };
  if (routeNames[status]) {
    router.push({ name: routeNames[status] });
  }
};
</script>

<template>
  <div class="p-4">
    <h1 class="text-3xl font-bold mb-4">Service Management Hub</h1>
    <div class="grid">
      <!-- Pending Requests Card -->
      <div class="col-12 md:col-6 lg:col-3">
        <pv-card class="cursor-pointer hover:shadow-lg transition-duration-150" @click="navigate('pending')">
          <template #title>
            <div class="flex justify-content-between align-items-center">
              <span>Pending Requests</span>
              <i class="pi pi-inbox text-blue-500 text-4xl"></i>
            </div>
          </template>
          <template #content>
            <p class="text-5xl font-bold text-blue-500">{{ counts.pending }}</p>
            <p class="text-color-secondary">Awaiting acceptance</p>
          </template>
        </pv-card>
      </div>

      <!-- In-Progress Card -->
      <div class="col-12 md:col-6 lg:col-3">
        <pv-card class="cursor-pointer hover:shadow-lg transition-duration-150" @click="navigate('in-progress')">
          <template #title>
            <div class="flex justify-content-between align-items-center">
              <span>In-Progress</span>
              <i class="pi pi-spin pi-cog text-orange-500 text-4xl"></i>
            </div>
          </template>
          <template #content>
            <p class="text-5xl font-bold text-orange-500">{{ counts.inProgress }}</p>
            <p class="text-color-secondary">Accepted or assigned</p>
          </template>
        </pv-card>
      </div>

      <!-- Completed Card -->
      <div class="col-12 md:col-6 lg:col-3">
        <pv-card class="cursor-pointer hover:shadow-lg transition-duration-150" @click="navigate('completed')">
          <template #title>
            <div class="flex justify-content-between align-items-center">
              <span>Completed</span>
              <i class="pi pi-check-circle text-green-500 text-4xl"></i>
            </div>
          </template>
          <template #content>
            <p class="text-5xl font-bold text-green-500">{{ counts.completed }}</p>
            <p class="text-color-secondary">Finished services</p>
          </template>
        </pv-card>
      </div>

      <!-- Rejected/Canceled Card -->
      <div class="col-12 md:col-6 lg:col-3">
        <pv-card class="cursor-pointer hover:shadow-lg transition-duration-150" @click="navigate('rejected-canceled')">
          <template #title>
            <div class="flex justify-content-between align-items-center">
              <span>Rejected / Canceled</span>
              <i class="pi pi-times-circle text-gray-500 text-4xl"></i>
            </div>
          </template>
          <template #content>
            <p class="text-5xl font-bold text-gray-500">{{ counts.rejected + counts.canceled }}</p>
            <p class="text-color-secondary">Not proceeding</p>
          </template>
        </pv-card>
      </div>
    </div>
  </div>
</template>
