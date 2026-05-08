<script setup>

import {onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import useAssetsManagementStore from "@/assets-management/application/assets-management.store.js";
import {useConfirm} from "primevue/useconfirm";

const {t} = useI18n();
const store = useAssetsManagementStore();
const { sites, sitesLoaded, errors, fetchSites, updateSite, deleteSite } = store;

onMounted(() => {
  if (!sitesLoaded) fetchSites();
  console.log(sites);
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
  await updateSite(editForm.value);
  displayEditDialog.value = false;
  await fetchSites();
};

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
    accept: () => {
      deleteSite(site)
    }
  })
}

</script>

<template>

  <section class="p-4">
    <pv-confirm-dialog />

    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="text-3xl font-bold">{{ t('sites.list.title') }}</h1>

      <RouterLink :to="{ name: 'sites' }">
        <pv-button :label="t('sites.list.title')" />
      </RouterLink>
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

      <pv-column field="contactName" :header="t('sites.detail.contactName')"/>
      <pv-column field="cantEquipment" :header="t('sites.detail.contactEquipment')"/>

      <pv-column field="phone" :header="t('sites.detail.contactPhone')">
        <template #body="slotProps">
              <span :style="{ fontWeight: 'bold' }">
                {{ slotProps.data.phone }}
              </span>
        </template>
      </pv-column>

      <pv-column field="created" :header="t('sites.detail.createdAt')" />
      <pv-column field="updated" :header="t('sites.detail.updatedAt')" />

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
      <div class="formgrid grid row-gap-3">

        <div class="field col-12 md:col-6">
          <label for="edit-name" class="block mb-2 font-medium">Name</label>
          <pv-input-text id="edit-name" v-model="editForm.name" class="w-full" required />
        </div>

        <div class="field col-12 md:col-6">
          <label for="edit-address" class="block mb-2 font-medium">Address</label>
          <pv-input-text id="edit-address" v-model="editForm.address" class="w-full" required />
        </div>

        <div class="field col-12 md:col-6">
          <label for="edit-contact-name" class="block mb-2 font-medium">Contact Name</label>
          <pv-input-text id="edit-contact-name" v-model="editForm.contactName" class="w-full" required />
        </div>

        <div class="field col-12 md:col-6">
          <label for="edit-phone" class="block mb-2 font-medium">Phone</label>
          <pv-input-text id="edit-phone" v-model="editForm.phone" class="w-full" required />
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
