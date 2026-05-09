<script setup>

import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { TechniciansApi } from '@/technician-management/infrastructure/technicians.api.js';
import { ReviewsApi } from '@/feedback/infrastructure/reviews.api.js';
import { useAuthStore } from '@/iam/application/auth.store.js';
import { useConfirm } from 'primevue/useconfirm';
import { Technician } from '../../domain/model/technician.entity.js';

const { t } = useI18n();
const techniciansApi = new TechniciansApi();
const reviewsApi = new ReviewsApi();
const authStore = useAuthStore();
const confirm = useConfirm();

/** @type {import('vue').Ref<boolean>} */
const loading = ref(false);
/** @type {import('vue').Ref<boolean>} */
const submitting = ref(false);
/** @type {import('vue').Ref<Array<Technician>>} */
const technicians = ref([]);
/** @type {import('vue').Ref<object>} */
const newTechnician = ref({ name: '', specialty: '', phone: '' });

const displayEditDialog = ref(false);
const editableTechnician = ref(null);

/**
 * The ID of the currently logged-in provider.
 * @type {import('vue').ComputedRef<number>}
 */
const currentProviderId = computed(() => authStore.currentUserId);

/**
 * Fetches technicians for the current provider and calculates their average ratings.
 * @async
 */
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

// Validacion Phone
const onPhoneInput = (event) => {
  const value = event.target.value.replace(/\D/g, '').slice(0, 9);
  newTechnician.value.phone = value;
  event.target.value = value;
};

const registerTechnician = async () => {
  if (!newTechnician.value.name || !newTechnician.value.specialty) return;
  if (newTechnician.value.phone && newTechnician.value.phone.length !== 9) return;

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

/**
 * Opens the dialog to edit a technician's details.
 * @param {Technician} technician - The technician to edit.
 */
const openEditDialog = (technician) => {
  editableTechnician.value = { ...technician };
  displayEditDialog.value = true;
};

/**
 * Saves the changes made to a technician.
 * @async
 */
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

/**
 * Shows a confirmation dialog before deleting a technician.
 * @param {Technician} technician - The technician to delete.
 */
const confirmDelete = (technician) => {
  confirm.require({
    message: t('provider.technicians.confirm-delete', { name: technician.name }),
    header: t('provider.technicians.confirm-delete-header'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteTechnician(technician.id),
  });
};

/**
 * Deletes a technician by their ID.
 * @param {number} id - The ID of the technician to delete.
 * @async
 */
const deleteTechnician = async (id) => {
  try {
    await techniciansApi.deleteTechnician(id);
    await fetchTechnicians();
  } catch (e) {
    console.error('Failed to delete technician.', e);
  }
};

const isFormValid = computed(() => {
  return (
      newTechnician.value.name.trim() !== '' &&
      newTechnician.value.specialty.trim() !== '' &&
      newTechnician.value.phone.length === 9
  );
});

const onTextInput = (event, field) => {
  const value = event.target.value.replace(/[0-9]/g, '');
  newTechnician.value[field] = value;
  event.target.value = value;
};

/**
 * Fetches initial data when the component is mounted.
 */
onMounted(fetchTechnicians);

</script>

<template>
  <div class="p-4">
    <h1 class="text-3xl font-bold mb-4">{{ t('provider.technicians.title') }}</h1>
    <div class="grid">
      <!-- Registration Form -->
      <div class="col-12 md:col-4">
        <pv-card>
          <template #title>{{ t('provider.technicians.register-new') }}</template>
          <template #content>
            <form @submit.prevent="registerTechnician" class="flex flex-column gap-5">
              <div class="p-fluid mt-3">

                <!-- Registration Name -->
                <pv-float-label>
                  <pv-input-text
                      id="name"
                      :value="newTechnician.name"
                      @input="onTextInput($event, 'name')"
                      required
                  />
                  <label for="name">{{ t('provider.technicians.name') }}</label>
                </pv-float-label>
              </div>

              <!-- Registration Speciality -->
              <div class="p-fluid">
                <pv-float-label>
                  <pv-input-text
                      id="specialty"
                      :value="newTechnician.specialty"
                      @input="onTextInput($event, 'specialty')"
                      required
                  />
                  <label for="specialty">{{ t('provider.technicians.specialty') }}</label>
                </pv-float-label>
              </div>

              <!-- Registration Phone -->
              <div class="p-fluid">
                <pv-float-label>
                  <pv-input-text
                      id="phone"
                      :value="newTechnician.phone"
                      @input="onPhoneInput"
                      maxlength="9"
                      inputmode="numeric"
                  />
                  <label for="phone">{{ t('provider.technicians.phone') }}</label>
                </pv-float-label>
              </div>

              <pv-button
                  type="submit"
                  :label="t('provider.technicians.register')"
                  icon="pi pi-plus"
                  :loading="submitting"
                  :disabled="!isFormValid"
              />
            </form>
          </template>
        </pv-card>
      </div>

      <!-- Technician List -->
      <div class="col-12 md:col-8">
        <pv-card>
          <template #title>{{ t('provider.technicians.my-technicians') }}</template>
          <template #content>
            <pv-data-table :value="technicians" :loading="loading" responsive-layout="scroll">
              <pv-column field="name" :header="t('provider.technicians.name')" sortable></pv-column>
              <pv-column field="specialty" :header="t('provider.technicians.specialty')" sortable></pv-column>
              <pv-column field="phone" :header="t('provider.technicians.phone')"></pv-column>
              <pv-column :header="t('provider.technicians.average-rating')" sortable field="averageRating">
                <template #body="{ data }">
                  <pv-rating :modelValue="data.averageRating" :readonly="true" :cancel="false" :stars="5" />
                  <span class="ml-2">({{ data.averageRating ? data.averageRating.toFixed(1) : 'N/A' }})</span>
                </template>
              </pv-column>
              <pv-column :header="t('provider.technicians.actions')" style="width: 10rem">
                <template #body="{ data }">
                  <pv-button icon="pi pi-pencil" text rounded class="mr-2" @click="openEditDialog(data)" />
                  <pv-button icon="pi pi-trash" text rounded severity="danger" @click="confirmDelete(data)" />
                </template>
              </pv-column>
              <template #empty>{{ t('provider.technicians.no-technicians') }}</template>
            </pv-data-table>
          </template>
        </pv-card>
      </div>
    </div>

    <!-- Edit Dialog -->
    <pv-dialog v-model:visible="displayEditDialog" :header="t('provider.technicians.edit-technician')" :modal="true" class="p-fluid" style="width: 30vw">
      <div v-if="editableTechnician" class="flex flex-column gap-4">
        <div class="p-fluid">
          <pv-float-label>
            <pv-input-text id="edit-name" v-model="editableTechnician.name" required />
            <label for="edit-name">{{ t('provider.technicians.name') }}</label>
          </pv-float-label>
        </div>
        <div class="p-fluid">
          <pv-float-label>
            <pv-input-text id="edit-specialty" v-model="editableTechnician.specialty" required />
            <label for="edit-specialty">{{ t('provider.technicians.specialty') }}</label>
          </pv-float-label>
        </div>
        <div class="p-fluid">
          <pv-float-label>
            <pv-input-text id="edit-phone" v-model="editableTechnician.phone" />
            <label for="edit-phone">{{ t('provider.technicians.phone') }}</label>
          </pv-float-label>
        </div>
      </div>
      <template #footer>
        <pv-button :label="t('common.cancel')" icon="pi pi-times" @click="displayEditDialog = false" class="p-button-text"/>
        <pv-button :label="t('common.save')" icon="pi pi-check" @click="saveTechnician" :loading="submitting" />
      </template>
    </pv-dialog>

    <pv-confirm-dialog />
  </div>
</template>
