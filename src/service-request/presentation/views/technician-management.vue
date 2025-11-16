<template>
  <div class="p-4">
    <h1 class="text-3xl font-bold mb-4">Technician Management</h1>
    <div class="grid">
      <!-- Registration Form -->
      <div class="col-12 md:col-4">
        <pv-card>
          <template #title>Register New Technician</template>
          <template #content>
            <form @submit.prevent="registerTechnician" class="flex flex-column gap-3">
              <div class="p-fluid">
                <pv-float-label>
                  <pv-input-text id="name" v-model="newTechnician.name" required />
                  <label for="name">Name</label>
                </pv-float-label>
              </div>
              <div class="p-fluid">
                <pv-float-label>
                  <pv-input-text id="specialty" v-model="newTechnician.specialty" required />
                  <label for="specialty">Specialty</label>
                </pv-float-label>
              </div>
              <pv-button type="submit" label="Register" icon="pi pi-plus" :loading="submitting"/>
            </form>
          </template>
        </pv-card>
      </div>

      <!-- Technician List -->
      <div class="col-12 md:col-8">
        <pv-card>
          <template #title>My Technicians</template>
          <template #content>
            <pv-data-table :value="technicians" :loading="loading" responsive-layout="scroll">
              <pv-column field="id" header="ID" sortable></pv-column>
              <pv-column field="name" header="Name" sortable></pv-column>
              <pv-column field="specialty" header="Specialty" sortable></pv-column>
              <pv-column header="Average Rating" sortable field="averageRating">
                <template #body="{ data }">
                  <pv-rating :modelValue="data.averageRating" :readonly="true" :cancel="false" stars="5" />
                  <span class="ml-2">({{ data.averageRating ? data.averageRating.toFixed(1) : 'N/A' }})</span>
                </template>
              </pv-column>
              <template #empty>
                No technicians found. Register one to get started.
              </template>
            </pv-data-table>
          </template>
        </pv-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { ServiceRequestsApi } from '@/service-request/infrastructure/service-requests-api.js';
import { useAuthStore } from '@/iam/application/auth.store.js';

const serviceApi = new ServiceRequestsApi();
const authStore = useAuthStore();

const loading = ref(false);
const submitting = ref(false);
const error = ref(null);
const technicians = ref([]);
const newTechnician = ref({ name: '', specialty: '' });

const currentProviderId = computed(() => authStore.currentUserId);

const fetchTechnicians = async () => {
  if (!currentProviderId.value) return;
  loading.value = true;
  try {
    const [techsResponse, reviewsResponse] = await Promise.all([
      serviceApi.getTechniciansByProvider(currentProviderId.value),
      serviceApi.http.get('/reviews') // Fetch all reviews
    ]);

    const allTechnicians = techsResponse.data;
    const allReviews = reviewsResponse.data;

    technicians.value = allTechnicians.map(tech => {
      const techReviews = allReviews.filter(review => review.technicianId === tech.id);
      const totalRating = techReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = techReviews.length > 0 ? totalRating / techReviews.length : 0;
      return { ...tech, averageRating };
    });

  } catch (e) {
    error.value = 'Failed to load technicians.';
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const registerTechnician = async () => {
  if (!newTechnician.value.name || !newTechnician.value.specialty) return;
  submitting.value = true;
  try {
    const dataToSend = { ...newTechnician.value, providerId: currentProviderId.value };
    await serviceApi.createTechnician(dataToSend);
    newTechnician.value = { name: '', specialty: '' }; // Reset form
    await fetchTechnicians();
  } catch (e) {
    error.value = 'Failed to register technician.';
    console.error(e);
  } finally {
    submitting.value = false;
  }
};

onMounted(fetchTechnicians);
</script>
