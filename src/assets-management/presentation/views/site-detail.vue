<script setup>

import { onMounted, ref } from "vue";
import { storeToRefs } from 'pinia';
import { useI18n } from "vue-i18n";
import useAssetsManagementStore from "@/assets-management/application/assets-management.store.js";
import { useConfirm } from "primevue/useconfirm";
import { useRouter } from 'vue-router';

const {t} = useI18n();
const store = useAssetsManagementStore();
const { sites, sitesLoaded, errors } = storeToRefs(store);
const { fetchSites, updateSite, deleteSite } = store;
const serverError = ref(null)
const router = useRouter();

onMounted(() => {
  if (!sitesLoaded.value) fetchSites();
});

const displayEditDialog = ref(false);

const editForm = ref({
  id: null,
  name: '',
  address: '',
  contactName: '',
  phone: ''
});

const openEditDialog = (site) => {
  editForm.value = {
    id: site.id,
    name: site.name,
    address: site.address,
    cantEquipment: site.cantEquipment,
    contactName: site.contactName,
    phone: site.phone
  };
  displayEditDialog.value = true;
};

const saveEditSite = async () => {
  serverError.value = null

  const sameName = sites.value.find(s =>
      s.id !== editForm.value.id &&
      s.name.toLowerCase() === editForm.value.name.toLowerCase()
  )
  if (sameName) { serverError.value = t('sites.new.error.duplicate-name'); return }

  const sameAddress = sites.value.find(s =>
      s.id !== editForm.value.id &&
      s.address.toLowerCase() === editForm.value.address.toLowerCase()
  )
  if (sameAddress) { serverError.value = t('sites.new.error.duplicate-address'); return }

  const samePhone = sites.value.find(s =>
      s.id !== editForm.value.id &&
      s.phone === editForm.value.phone
  )
  if (samePhone) { serverError.value = t('sites.new.error.duplicate-phone'); return }

  try {
    await updateSite(editForm.value)
    displayEditDialog.value = false
  } catch (error) {
    serverError.value = t('sites.new.alert-create-error')
    console.error('Error updating site:', error)
  }
}

const confirm = useConfirm();

const confirmDelete = (site) => {
  if (!site.id) {
    alert("No se encontró el ID del site");
    return;
  }
  confirm.require({
    message: t('sites.detail.askDelete', { name: site.name }),
    header: t('sites.detail.askDelete'),
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      await deleteSite(site)
      await fetchSites()
    }
  })
}

const onEditPhoneInput = (event) => {
  const value = event.target.value.replace(/\D/g, '').slice(0, 9);
  editForm.value.phone = value;
  event.target.value = value;
};

const onEditTextInput = (event, field) => {
  const value = event.target.value.replace(/[0-9]/g, '');
  editForm.value[field] = value;
  event.target.value = value;
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(value));
};

</script>

<template>
  <section class="p-4">
    <pv-confirm-dialog />

    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="sd-page-title">{{ t('sites.list.title') }}</h1>
      <pv-button
          icon="pi pi-arrow-left"
          :label="t('common.back')"
          text
          severity="secondary"
          @click="router.back()"
      />
    </div>

    <pv-data-table
        :value="sites"
        :loading="!sitesLoaded"
        striped-rows
        table-style="min-width: 80rem"
        paginator
        :rows="5"
        :rows-per-page-options="[5, 10, 20]"
        class="sd-table"
    >
      <pv-column field="contactName"   :header="t('sites.detail.contactName')" />
      <pv-column field="cantEquipment" :header="t('sites.detail.contactEquipment')" />

      <pv-column field="phone" :header="t('sites.detail.contactPhone')">
        <template #body="slotProps">
          <span class="sd-phone-cell">{{ slotProps.data.phone }}</span>
        </template>
      </pv-column>

      <pv-column field="created" :header="t('sites.detail.createdAt')">
        <template #body="{ data }">{{ formatDate(data.updated) }}</template>
      </pv-column>

      <pv-column field="updated" :header="t('sites.detail.updatedAt')">
        <template #body="{ data }">{{ formatDate(data.updated) }}</template>
      </pv-column>

      <pv-column :header="t('sites.detail.actions')">
        <template #body="{ data }">
          <div class="sd-actions">
            <pv-button
                icon="pi pi-pencil"
                text rounded
                severity="warning"
                class="sd-action-btn"
                v-tooltip.top="t('common.edit')"
                @click="openEditDialog(data)"
            />
            <pv-button
                icon="pi pi-trash"
                text rounded
                severity="danger"
                class="sd-action-btn sd-action-btn--danger"
                v-tooltip.top="t('common.delete')"
                @click="confirmDelete(data)"
            />
          </div>
        </template>
      </pv-column>
    </pv-data-table>

    <!-- Edit Dialog -->
    <pv-dialog
        v-model:visible="displayEditDialog"
        :header="t('sites.detail.title')"
        :modal="true"
        class="p-fluid"
        style="width: 50vw"
    >
      <div v-if="serverError" class="sd-server-error mb-3">
        <i class="pi pi-exclamation-triangle" />
        <span>{{ serverError }}</span>
      </div>

      <div class="formgrid grid row-gap-3">

        <div class="field col-12 md:col-6">
          <label class="sd-label">{{ t('sites.new.name') }}</label>
          <pv-input-text id="edit-name" :value="editForm.name" @input="onEditTextInput($event, 'name')" class="w-full" required />
        </div>

        <div class="field col-12 md:col-6">
          <label class="sd-label">{{ t('sites.new.address') }}</label>
          <pv-input-text id="edit-address" v-model="editForm.address" class="w-full" required />
        </div>

        <div class="field col-12 md:col-6">
          <label class="sd-label">{{ t('sites.new.contact-name') }}</label>
          <pv-input-text id="edit-contact-name" :value="editForm.contactName" @input="onEditTextInput($event, 'contactName')" class="w-full" required />
        </div>

        <div class="field col-12 md:col-6">
          <label class="sd-label">{{ t('sites.new.phone') }}</label>
          <pv-input-text
              id="edit-phone"
              :value="editForm.phone"
              @input="onEditPhoneInput"
              class="w-full"
              maxlength="9"
              inputmode="numeric"
              :invalid="editForm.phone.length > 0 && editForm.phone.length < 9"
          />
          <small
              v-if="editForm.phone.length > 0 && editForm.phone.length < 9"
              class="sd-field-hint sd-field-hint--error"
          >
            <i class="pi pi-exclamation-triangle" style="font-size:11px" />
            {{ t('sites.new.phone-invalid') }}
          </small>
          <small v-else class="sd-field-hint">9 digits only</small>
        </div>

      </div>

      <template #footer>
        <pv-button :label="t('common.cancel')" icon="pi pi-times" class="p-button-text" @click="displayEditDialog = false" />
        <pv-button :label="t('common.save')" icon="pi pi-check" severity="success" @click="saveEditSite" />
      </template>
    </pv-dialog>

    <div v-if="errors.length" class="sd-error-bar mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>
  </section>
</template>

<style scoped>
.sd-page-title {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--text-color);
  letter-spacing: -0.01em;
  margin: 0;
}

/* Table */
.sd-table :deep(.p-datatable-thead > tr > th) {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-color-secondary);
  background: var(--surface-ground);
  border-bottom: 0.5px solid var(--surface-border);
}

.sd-table :deep(.p-datatable-tbody > tr > td) {
  font-size: 13px;
  border-bottom: 0.5px solid var(--surface-border);
  padding: 0.65rem 1rem;
}

.sd-table :deep(.p-datatable-tbody > tr) {
  transition: background 0.12s;
}

/* Phone cell */
.sd-phone-cell {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-color);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

/* Actions */
.sd-actions { display: flex; gap: 2px; }

.sd-action-btn :deep(.p-button-icon) { font-size: 13px; }
.sd-action-btn--danger:hover :deep(.p-button-icon) { color: #A32D2D; }

/* Server error banner */
.sd-server-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.75rem 1rem;
  background: #FCEBEB;
  border: 0.5px solid #F09595;
  color: #A32D2D;
  border-radius: 8px;
  font-size: 13px;
}

/* Labels */
.sd-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-color-secondary);
  margin-bottom: 5px;
}

/* Field hints */
.sd-field-hint {
  display: block;
  font-size: 11px;
  color: var(--text-color-secondary);
  opacity: 0.7;
  margin-top: 4px;
}
.sd-field-hint--error {
  color: #A32D2D;
  opacity: 1;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Error bar */
.sd-error-bar {
  font-size: 13px;
  color: #A32D2D;
}
</style>