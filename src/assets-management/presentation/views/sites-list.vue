<script setup>

import { onMounted, ref } from "vue";
import useAssetsManagementStore from "@/assets-management/application/assets-management.store.js";
import { useI18n } from "vue-i18n";
import MapLocationPicker from "@/shared/presentation/components/MapLocationPicker.vue";
import { useAuthStore } from "@/iam/application/auth.store.js";

const { t } = useI18n();
const store = useAssetsManagementStore();
const authStore = useAuthStore();
const { sites, sitesLoaded, errors, fetchSites, createSite } = store;
const displayNewSiteDialog = ref(false);
const showMap = ref(false);
const newSite = ref({
  name: '',
  address: '',
  contactName: '',
  phone: '',
  latitude: null,
  longitude: null,
  ownerId: authStore.currentUserId
});

onMounted(() => {
  if (!sitesLoaded.value) fetchSites();
});

const openNewSiteDialog = () => {
  newSite.value = {
    name: '',
    address: '',
    contactName: '',
    phone: '',
    latitude: null,
    longitude: null,
    ownerId: authStore.currentUserId
  };

  currentLocation.value = null;
  showMap.value = false;
  displayNewSiteDialog.value = true;
};

const handleLocationSelected = (location) => {
  newSite.value.address = location.address;
  newSite.value.latitude = location.lat;
  newSite.value.longitude = location.lng;
};

const currentLocation = ref(null);

// Obtener ubicación actual
const getCurrentLocation = () => {
  if (showMap.value === true) {
    showMap.value = false;
    return;
  }

  showMap.value = true;

  if (!navigator.geolocation) {
    alert("Tu navegador no soporta geolocalización");
    return;
  }

  navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        newSite.value.latitude = lat;
        newSite.value.longitude = lng;

        // Enviamos ubicación actual al mapa
        currentLocation.value = { lat, lng };

        alert("Ubicación obtenida correctamente");
      },
      () => {
        alert("No se pudo obtener tu ubicación. Activa los permisos.");
      }
  );
};

const saveNewSite = async () => {
  if (!newSite.value.name || !newSite.value.address || !newSite.value.contactName || !newSite.value.phone) {
    alert(t('sites.new.alert-required-fields'));
    return;
  }
  try {
    await createSite(newSite.value);
    alert(t('sites.new.alert-site-created'));
    displayNewSiteDialog.value = false;
    await fetchSites(); // Refresh the list
  } catch (error) {
    alert(t('sites.new.alert-create-error'));
    console.error('Error creating site:', error);
  }
};

</script>

<template>

  <section class="p-4">
    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="text-3xl font-bold">{{ t('sites.list.title') }}</h1>

      <pv-button :label="t('sites.new.title')" icon="pi pi-plus" severity="success" @click="openNewSiteDialog" />
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
      <!-- Site Name -->
      <pv-column field="name" :header="t('sites.list.name')" />

      <!-- Site Address -->
      <pv-column field="address" :header="t('sites.list.address')"/>

      <!-- Site Phone -->
      <pv-column field="phone" :header="t('sites.detail.contactPhone')"/>

      <pv-column :header="t('sites.list.information')">
        <template #body="{ data }">
          <RouterLink :to="{ name: 'site-detail', params: { siteId: data.id } }">
            <pv-button icon="pi pi-eye" text rounded severity="info" v-tooltip.top="t('sites.detail.view')" />
          </RouterLink>
        </template>
      </pv-column>

      <template #empty>
        {{ t('sites.list.empty') }}
      </template>
    </pv-data-table>

    <div v-if="errors.length" class="text-red-500 mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>

    <pv-dialog v-model:visible="displayNewSiteDialog" :header="t('sites.new.title')" :modal="true" class="p-fluid" style="width: 50vw" >
      <form @submit.prevent="saveNewSite" class="flex flex-column gap-4">

        <!-- Inputs -->
        <div class="formgrid grid row-gap-3">
          <div class="field col-12 md:col-6 mt-4">
            <pv-float-label>
              <pv-input-text id="site-name" v-model="newSite.name" class="w-full" required />
              <label for="site-name">{{ t('sites.new.name') }}</label>
            </pv-float-label>
          </div>

          <div class="field col-12 md:col-6 mt-4">
            <pv-float-label>
              <pv-input-text id="site-address" v-model="newSite.address" class="w-full" required />
              <label for="site-address">{{ t('sites.new.address') }}</label>
            </pv-float-label>
          </div>

          <div class="field col-12 md:col-6">
            <pv-float-label>
              <pv-input-text id="contact-name" v-model="newSite.contactName" class="w-full" required />
              <label for="contact-name">{{ t('sites.new.contact-name') }}</label>
            </pv-float-label>
          </div>

          <div class="field col-12 md:col-6">
            <pv-float-label>
              <pv-input-text id="phone" v-model="newSite.phone" class="w-full" required />
              <label for="phone">{{ t('sites.new.phone') }}</label>
            </pv-float-label>
          </div>
        </div>

        <!-- Botón para ubicación actual -->
        <pv-button
            label="Usar mi ubicación actual"
            icon="pi pi-map-marker"
            severity="info"
            text
            type="button"
            @click="getCurrentLocation"
        />

        <!-- Mapa -->
        <div v-if="showMap" class="map-section mt-0">
          <MapLocationPicker
              :current-location="currentLocation"
              @location-selected="handleLocationSelected"
          />
        </div>
      </form>
      <template #footer>
        <pv-button :label="t('common.cancel')" icon="pi pi-times" @click="displayNewSiteDialog = false" class="p-button-text"/>
        <pv-button :label="t('sites.new.register')" icon="pi pi-check" @click="saveNewSite" />
      </template>
    </pv-dialog>
  </section>

</template>

<style scoped>

.map-section {
  height: 400px; /* Ensure map has height */
  width: 100%;
  margin-top: 1rem;
}

</style>
