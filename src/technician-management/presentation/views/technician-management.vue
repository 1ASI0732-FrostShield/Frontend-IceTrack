<script setup>
import { ref, onMounted, computed } from 'vue';
import { TechniciansApi } from '@/technician-management/infrastructure/technicians.api.js';
import { ReviewsApi } from '@/feedback/infrastructure/reviews.api.js';
import { useAuthStore } from '@/iam/application/auth.store.js';
import { useConfirm } from 'primevue/useconfirm';
import { Technician } from '../../domain/model/technician.entity.js';

const techniciansApi = new TechniciansApi();
const reviewsApi = new ReviewsApi();
const authStore = useAuthStore();
const confirm = useConfirm();

const loading = ref(false);
const submitting = ref(false);
const technicians = ref([]);
const newTechnician = ref({ name: '', specialty: '', phone: '' });

const displayEditDialog = ref(false);
const editableTechnician = ref(null);

const currentProviderId = computed(() => authStore.currentUserId);

const fetchTechnicians = async () => {
  if (!currentProviderId.value) return;
  loading.value = true;
  try {
    const [techsResponse, reviewsResponse] = await Promise.all([
      techniciansApi.getTechniciansByProvider(currentProviderId.value),
      reviewsApi.getAllReviews()
    ]);
    const allTechnicians = techsResponse.data;
    const allReviews = reviewsResponse.data;
    technicians.value = allTechnicians.map(techData => {
      const techReviews = allReviews.filter(review => review.technicianId === techData.id);
      const totalRating = techReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = techReviews.length > 0 ? totalRating / techReviews.length : 0;
      return new Technician({ ...techData, averageRating });
    });
  } catch (e) {
    console.error('Failed to load technicians.', e);
  } finally {
    loading.value = false;
  }
};

const registerTechnician = async () => {
  if (!newTechnician.value.name || !newTechnician.value.specialty) return;
  submitting.value = true;
  try {
    const dataToSend = { ...newTechnician.value, providerId: currentProviderId.value };
    await techniciansApi.createTechnician(dataToSend);
    newTechnician.value = { name: '', specialty: '', phone: '' };
    await fetchTechnicians();
  } catch (e) {
    console.error('Failed to register technician.', e);
  } finally {
    submitting.value = false;
  }
};

const openEditDialog = (technician) => {
  editableTechnician.value = { ...technician };
  displayEditDialog.value = true;
};

const saveTechnician = async () => {
  if (!editableTechnician.value) return;
  submitting.value = true;
  try {
    await techniciansApi.updateTechnician(editableTechnician.value.id, editableTechnician.value);
    displayEditDialog.value = false;
    await fetchTechnicians();
  } catch (e) {
    console.error('Failed to update technician.', e);
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = (technician) => {
  confirm.require({
    message: `Are you sure you want to delete ${technician.name}?`,
    header: 'Confirm Deletion',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteTechnician(technician.id),
  });
};

const deleteTechnician = async (id) => {
  try {
    await techniciansApi.deleteTechnician(id);
    await fetchTechnicians();
  } catch (e) {
    console.error('Failed to delete technician.', e);
  }
};

onMounted(fetchTechnicians);
</script>

<template>
  <div class="p-4">
    <h1 class="text-3xl font-bold mb-4">Technician Management</h1>
    <div class="grid">
      <!-- Registration Form -->
      <div class="col-12 md:col-4">
        <pv-card>
          <template #title>Register New Technician</template>
          <template #content>
            <form @submit.prevent="registerTechnician" class="flex flex-column gap-4">
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
              <div class="p-fluid">
                <pv-float-label>
                  <pv-input-text id="phone" v-model="newTechnician.phone" />
                  <label for="phone">Phone</label>
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
              <pv-column field="name" header="Name" sortable></pv-column>
              <pv-column field="specialty" header="Specialty" sortable></pv-column>
              <pv-column field="phone" header="Phone"></pv-column>
              <pv-column header="Average Rating" sortable field="averageRating">
                <template #body="{ data }">
                  <pv-rating :modelValue="data.averageRating" :readonly="true" :cancel="false" :stars="5" />
                  <span class="ml-2">({{ data.averageRating ? data.averageRating.toFixed(1) : 'N/A' }})</span>
                </template>
              </pv-column>
              <pv-column header="Actions" style="width: 10rem">
                <template #body="{ data }">
                  <pv-button icon="pi pi-pencil" text rounded class="mr-2" @click="openEditDialog(data)" />
                  <pv-button icon="pi pi-trash" text rounded severity="danger" @click="confirmDelete(data)" />
                </template>
              </pv-column>
              <template #empty>No technicians found. Register one to get started.</template>
            </pv-data-table>
          </template>
        </pv-card>
      </div>
    </div>

    <!-- Edit Dialog -->
    <pv-dialog v-model:visible="displayEditDialog" header="Edit Technician" :modal="true" class="p-fluid" style="width: 30vw">
      <div v-if="editableTechnician" class="flex flex-column gap-4">
        <div class="p-fluid">
          <pv-float-label>
            <pv-input-text id="edit-name" v-model="editableTechnician.name" required />
            <label for="edit-name">Name</label>
          </pv-float-label>
        </div>
        <div class="p-fluid">
          <pv-float-label>
            <pv-input-text id="edit-specialty" v-model="editableTechnician.specialty" required />
            <label for="edit-specialty">Specialty</label>
          </pv-float-label>
        </div>
        <div class="p-fluid">
          <pv-float-label>
            <pv-input-text id="edit-phone" v-model="editableTechnician.phone" />
            <label for="edit-phone">Phone</label>
          </pv-float-label>
        </div>
      </div>
      <template #footer>
        <pv-button label="Cancel" icon="pi pi-times" @click="displayEditDialog = false" class="p-button-text"/>
        <pv-button label="Save" icon="pi pi-check" @click="saveTechnician" :loading="submitting" />
      </template>
    </pv-dialog>

    <pv-confirm-dialog />
  </div>
</template>
