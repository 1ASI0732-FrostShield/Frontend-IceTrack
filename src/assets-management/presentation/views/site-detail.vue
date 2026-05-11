<script setup>

import { onMounted, ref, computed } from "vue";
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
      <h1 class="text-3xl font-bold">{{ t('sites.list.title') }}</h1>

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
    >
      <!-- Contact Name -->
      <pv-column field="contactName" :header="t('sites.detail.contactName')"/>

      <!-- Cant Equipment -->
      <pv-column field="cantEquipment" :header="t('sites.detail.contactEquipment')"/>

      <!-- Phone -->
      <pv-column field="phone" :header="t('sites.detail.contactPhone')">
        <template #body="slotProps">
              <span :style="{ fontWeight: 'bold' }">
                {{ slotProps.data.phone }}
              </span>
        </template>
      </pv-column>

      <!-- Created At -->
      <pv-column field="created" :header="t('sites.detail.createdAt')">
        <template #body="{ data }">
          {{ formatDate(data.updated) }}
        </template>
      </pv-column>

      <!-- Updated At -->
      <pv-column field="updated" :header="t('sites.detail.updatedAt')">
        <template #body="{ data }">
          {{ formatDate(data.updated) }}
        </template>
      </pv-column>

      <!-- Details -->
      <pv-column :header="t('sites.detail.actions')">
        <template #body="{ data }">
          <div class="flex gap-2">
            <pv-button
                icon="pi pi-pencil"
                text
                rounded
                severity="warning"
                v-tooltip.top="'Edit'"
                @click="openEditDialog(data)"
            />
            <pv-button
                type="button"
                icon="pi pi-trash"
                rounded
                severity="danger"
                text
                @click="confirmDelete(data)"
            />
          </div>
        </template>
      </pv-column>

    </pv-data-table>

    <pv-dialog
        v-model:visible="displayEditDialog"
        header="Edit Site"
        :modal="true"
        class="p-fluid"
        style="width: 50vw"
    >
      <div v-if="serverError"
           class="flex align-items-center gap-2 p-3 mb-3 border-round"
           style="background: #fdecea; border: 1px solid #f5c2c7; color: #842029; border-radius: 6px;">
        <i class="pi pi-exclamation-triangle" />
        <span>{{ serverError }}</span>
      </div>

      <div class="formgrid grid row-gap-3">

        <div class="field col-12 md:col-6">
          <label for="edit-name" class="block mb-2 font-medium">Name</label>
          <pv-input-text id="edit-name" :value="editForm.name" @input="onEditTextInput($event, 'name')" class="w-full" required />
        </div>

        <div class="field col-12 md:col-6">
          <label for="edit-address" class="block mb-2 font-medium">Address</label>
          <pv-input-text id="edit-address" v-model="editForm.address" class="w-full" required />
        </div>

        <div class="field col-12 md:col-6">
          <label for="edit-contact-name" class="block mb-2 font-medium">Contact Name</label>
          <pv-input-text id="edit-contact-name" :value="editForm.contactName" @input="onEditTextInput($event, 'contactName')" class="w-full" required />
        </div>

        <div class="field col-12 md:col-6">
          <label for="edit-phone" class="block mb-2 font-medium">Phone</label>
          <pv-input-text
              id="edit-phone"
              :value="editForm.phone"
              @input="onEditPhoneInput"
              class="w-full"
              maxlength="9"
              inputmode="numeric"
              :invalid="editForm.phone.length > 0 && editForm.phone.length < 9"
          />
        </div>

      </div>

      <template #footer>
        <pv-button
            label="Cancel"
            icon="pi pi-times"
            class="p-button-text"
            @click="displayEditDialog = false"
        />
        <pv-button
            label="Save"
            icon="pi pi-check"
            severity="success"
            @click="saveEditSite"
        />
      </template>
    </pv-dialog>

    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>

  </section>
</template>

<style scoped>

</style>
