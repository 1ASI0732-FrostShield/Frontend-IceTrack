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
      newTechnician.value.phone.length === 9 &&
      !isPhoneDuplicate.value
  );
});

const onTextInput = (event, field) => {
  const value = event.target.value.replace(/[0-9]/g, '');
  newTechnician.value[field] = value;
  event.target.value = value;
};

onMounted(fetchTechnicians);

const isPhoneDuplicate = computed(() => {
  if (!newTechnician.value.phone || newTechnician.value.phone.length !== 9) return false;
  return technicians.value.some(tech => tech.phone === newTechnician.value.phone);
});

const specialties = [
  'Refrigeration Technician',
  'HVAC Technician',
  'Ice Machine Technician',
  'Cooling Technician',
  'Service Technician',
  'Maintenance Technician',
  'Repair Technician',
];

const onEditPhoneInput = (event) => {
  const value = event.target.value.replace(/\D/g, '').slice(0, 9);
  editableTechnician.value.phone = value;
  event.target.value = value;
};

const onEditTextInput = (event, field) => {
  const value = event.target.value.replace(/[0-9]/g, '');
  editableTechnician.value[field] = value;
  event.target.value = value;
};

const isEditPhoneDuplicate = computed(() => {
  if (!editableTechnician.value?.phone || editableTechnician.value.phone.length !== 9) return false;
  return technicians.value.some(
      tech => tech.phone === editableTechnician.value.phone && tech.id !== editableTechnician.value.id
  );
});

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
};

const avatarColors = [
  { bg: '#B5D4F4', color: '#0C447C' },
  { bg: '#9FE1CB', color: '#085041' },
  { bg: '#F5C4B3', color: '#712B13' },
  { bg: '#CECBF6', color: '#3C3489' },
  { bg: '#F4C0D1', color: '#72243E' },
  { bg: '#C0DD97', color: '#3B6D11' },
];

const getAvatarStyle = (name) => {
  const index = (name?.charCodeAt(0) ?? 0) % avatarColors.length;
  return avatarColors[index];
};
</script>

<template>
  <div class="p-4">
    <pv-confirm-dialog />

    <h1 class="tm-page-title">{{ t('provider.technicians.title') }}</h1>

    <div class="grid">
      <!-- Registration Form -->
      <div class="col-12 md:col-4">
        <pv-card class="tm-card">
          <template #title>
            <span class="tm-card-title">{{ t('provider.technicians.register-new') }}</span>
          </template>
          <template #content>
            <form @submit.prevent="registerTechnician" class="flex flex-column gap-4">

              <div class="tm-field">
                <label class="tm-label">{{ t('provider.technicians.name') }}</label>
                <pv-input-text
                    id="name"
                    :value="newTechnician.name"
                    @input="onTextInput($event, 'name')"
                    class="w-full tm-input"
                    required
                />
              </div>

              <div class="tm-field">
                <label class="tm-label">{{ t('provider.technicians.specialty') }}</label>
                <pv-dropdown
                    id="specialty"
                    v-model="newTechnician.specialty"
                    :options="specialties"
                    class="w-full"
                />
              </div>

              <div class="tm-field">
                <label class="tm-label">{{ t('provider.technicians.phone') }}</label>
                <pv-input-text
                    id="phone"
                    :value="newTechnician.phone"
                    @input="onPhoneInput"
                    maxlength="9"
                    inputmode="numeric"
                    class="w-full tm-input"
                    :class="{ 'p-invalid': isPhoneDuplicate }"
                />
                <small v-if="isPhoneDuplicate" class="tm-error-msg">
                  <i class="pi pi-exclamation-triangle" />
                  {{ t('provider.technicians.phone-duplicate') }}
                </small>
                <small v-else class="tm-hint">9 digits only</small>
              </div>

              <pv-button
                  type="submit"
                  :label="t('provider.technicians.register')"
                  icon="pi pi-plus"
                  :loading="submitting"
                  :disabled="!isFormValid"
                  class="tm-btn-register"
              />
            </form>
          </template>
        </pv-card>
      </div>

      <!-- Technician List -->
      <div class="col-12 md:col-8">
        <pv-card class="tm-card">
          <template #title>
            <span class="tm-card-title">{{ t('provider.technicians.my-technicians') }}</span>
          </template>
          <template #content>
            <pv-data-table :value="technicians" :loading="loading" responsive-layout="scroll" class="tm-table">

              <pv-column field="name" :header="t('provider.technicians.name')" sortable>
                <template #body="{ data }">
                  <div class="tm-name-cell">
                    <div
                        class="tm-avatar"
                        :style="{
                          background: getAvatarStyle(data.name).bg,
                          color: getAvatarStyle(data.name).color
                        }"
                    >
                      {{ getInitials(data.name) }}
                    </div>
                    <span>{{ data.name }}</span>
                  </div>
                </template>
              </pv-column>

              <pv-column field="specialty" :header="t('provider.technicians.specialty')" sortable />
              <pv-column field="phone" :header="t('provider.technicians.phone')" />

              <pv-column :header="t('provider.technicians.average-rating')" sortable field="averageRating">
                <template #body="{ data }">
                  <div class="tm-rating-cell">
                    <pv-rating :modelValue="data.averageRating" :readonly="true" :cancel="false" :stars="5" />
                    <span class="tm-rating-val">
                      ({{ data.averageRating ? data.averageRating.toFixed(1) : 'N/A' }})
                    </span>
                  </div>
                </template>
              </pv-column>

              <pv-column :header="t('provider.technicians.actions')" style="width: 8rem">
                <template #body="{ data }">
                  <div class="tm-actions">
                    <pv-button
                        icon="pi pi-pencil"
                        text rounded
                        class="tm-action-btn"
                        v-tooltip.top="t('common.edit')"
                        @click="openEditDialog(data)"
                    />
                    <pv-button
                        icon="pi pi-trash"
                        text rounded
                        severity="danger"
                        class="tm-action-btn tm-action-btn-danger"
                        v-tooltip.top="t('common.delete')"
                        @click="confirmDelete(data)"
                    />
                  </div>
                </template>
              </pv-column>

              <template #empty>{{ t('provider.technicians.no-technicians') }}</template>
            </pv-data-table>
          </template>
        </pv-card>
      </div>
    </div>

    <!-- Edit Dialog -->
    <pv-dialog
        v-model:visible="displayEditDialog"
        :modal="true"
        :show-header="false"
        class="tm-edit-dialog"
        style="width: 30vw; border-radius: 12px; overflow: hidden;"
        content-style="padding: 0;"
    >
      <div v-if="editableTechnician">

        <!-- Custom Header -->
        <div class="ed-header">
          <div class="ed-header-left">
            <div
                class="tm-avatar ed-avatar"
                :style="{
                  background: getAvatarStyle(editableTechnician.name).bg,
                  color: getAvatarStyle(editableTechnician.name).color
                }"
            >
              {{ getInitials(editableTechnician.name) }}
            </div>
            <div>
              <p class="ed-name">{{ editableTechnician.name }}</p>
              <p class="ed-sub">{{ t('provider.technicians.edit-technician') }}</p>
            </div>
          </div>
          <pv-button
              icon="pi pi-times"
              text rounded
              class="tm-action-btn"
              :aria-label="t('common.cancel')"
              @click="displayEditDialog = false"
          />
        </div>

        <!-- Body -->
        <div class="ed-body">

          <div class="tm-field">
            <label class="tm-label">{{ t('provider.technicians.name') }}</label>
            <pv-input-text
                id="edit-name"
                :value="editableTechnician.name"
                @input="onEditTextInput($event, 'name')"
                class="w-full"
            />
          </div>

          <div class="tm-field">
            <label class="tm-label">{{ t('provider.technicians.specialty') }}</label>
            <pv-dropdown
                id="edit-specialty"
                v-model="editableTechnician.specialty"
                :options="specialties"
                class="w-full"
            />
          </div>

          <div class="tm-field">
            <label class="tm-label">{{ t('provider.technicians.phone') }}</label>
            <pv-input-text
                id="edit-phone"
                :value="editableTechnician.phone"
                @input="onEditPhoneInput"
                maxlength="9"
                inputmode="numeric"
                class="w-full"
                :class="{ 'p-invalid': isEditPhoneDuplicate }"
            />
            <small v-if="isEditPhoneDuplicate" class="tm-error-msg">
              <i class="pi pi-exclamation-triangle" />
              {{ t('provider.technicians.phone-duplicate') }}
            </small>
            <small v-else class="tm-hint">9 digits only</small>
          </div>
        </div>

        <!-- Footer -->
        <div class="ed-footer">
          <pv-button
              :label="t('common.cancel')"
              icon="pi pi-times"
              class="p-button-text"
              @click="displayEditDialog = false"
          />
          <pv-button
              :label="t('common.save')"
              icon="pi pi-check"
              severity="info"
              :loading="submitting"
              :disabled="isEditPhoneDuplicate"
              @click="saveTechnician"
          />
        </div>
      </div>
    </pv-dialog>

  </div>
</template>

<style scoped>
/* Page */
.tm-page-title {
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

/* Card */
.tm-card :deep(.p-card-body) { padding: 1.25rem; }
.tm-card :deep(.p-card-title) { padding-bottom: 0; margin-bottom: 0; }
.tm-card :deep(.p-card-content) { padding-top: 1rem; }

.tm-card-title {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Fields */
.tm-field { display: flex; flex-direction: column; gap: 5px; }

.tm-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-color-secondary);
}

.tm-hint {
  font-size: 11px;
  color: var(--text-color-secondary);
  opacity: 0.7;
}

.tm-error-msg {
  font-size: 11px;
  color: #A32D2D;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Register button */
.tm-btn-register {
  width: 100%;
  margin-top: 0.5rem;
}

/* Table */
.tm-table :deep(.p-datatable-thead > tr > th) {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-color-secondary);
  background: var(--surface-ground);
  border-bottom: 0.5px solid var(--surface-border);
}

.tm-table :deep(.p-datatable-tbody > tr) {
  transition: background 0.12s;
}

.tm-table :deep(.p-datatable-tbody > tr > td) {
  font-size: 13px;
  border-bottom: 0.5px solid var(--surface-border);
  padding: 0.65rem 1rem;
}

/* Avatar */
.tm-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 500;
  flex-shrink: 0;
}

.tm-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Rating */
.tm-rating-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tm-rating-val {
  font-size: 12px;
  color: var(--text-color-secondary);
}

/* Action buttons */
.tm-actions { display: flex; gap: 2px; }

.tm-action-btn :deep(.p-button-icon) { font-size: 13px; }

.tm-action-btn-danger:hover :deep(.p-button-icon) { color: #A32D2D; }

/* Edit Dialog */
.ed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 0.5px solid var(--surface-border);
}

.ed-header-left { display: flex; align-items: center; gap: 10px; }

.ed-avatar {
  width: 34px !important;
  height: 34px !important;
  font-size: 13px !important;
}

.ed-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-color);
  margin: 0;
  line-height: 1.3;
}

.ed-sub {
  font-size: 12px;
  color: var(--text-color-secondary);
  margin: 0;
}

.ed-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ed-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 1rem 1.25rem;
  border-top: 0.5px solid var(--surface-border);
}
</style>
