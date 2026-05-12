<script setup>

import { onMounted, ref, computed } from "vue";
import { storeToRefs } from 'pinia';
import useAssetsManagementStore from "@/assets-management/application/assets-management.store.js";
import { useI18n } from "vue-i18n";
import MapLocationPicker from "@/shared/presentation/components/MapLocationPicker.vue";
import { useAuthStore } from "@/iam/application/auth.store.js";

const { t } = useI18n();
const store = useAssetsManagementStore();
const authStore = useAuthStore();
const { sites, sitesLoaded, errors } = storeToRefs(store);
const { fetchSites, createSite } = store;
const displayNewSiteDialog = ref(false);
const showMap = ref(false);
const serverError = ref(null)

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
    address: null,
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
const phoneTouched = ref(false)
const phoneIsValid = computed(() => /^[0-9]{9}$/.test(newSite.value.phone))

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
  serverError.value = null
  phoneTouched.value = true

  if (!newSite.value.name || !newSite.value.address ||
      !newSite.value.contactName || !newSite.value.phone) {
    alert(t('sites.new.alert-required-fields'))
    return
  }

  if (!phoneIsValid.value) {
    alert(t('sites.new.alert-invalid-phone'))
    return
  }

  const sameName = sites.value.find(s =>
      s.name.toLowerCase() === newSite.value.name.toLowerCase()
  )
  if (sameName) {
    serverError.value = t('sites.new.error.duplicate-name')
    return
  }

  const sameAddress = sites.value.find(s =>
      s.address.toLowerCase() === newSite.value.address.toLowerCase()
  )
  if (sameAddress) {
    serverError.value = t('sites.new.error.duplicate-address')
    return
  }

  const samePhone = sites.value.find(s => s.phone === newSite.value.phone)
  if (samePhone) {
    serverError.value = t('sites.new.error.duplicate-phone')
    return
  }

  try {
    await createSite(newSite.value)
    alert(t('sites.new.alert-site-created'))
    displayNewSiteDialog.value = false
    await fetchSites()
  } catch (error) {
    serverError.value = t('sites.new.alert-create-error')
    console.error('Error creating site:', error)
  }
}

const isFormValid = computed(() => {
  return (
      newSite.value.name.trim() !== '' &&
      (newSite.value.address ?? '').trim() !== '' &&
      newSite.value.contactName.trim() !== '' &&
      newSite.value.phone.length === 9
  );
});

const onPhoneInput = (event) => {
  const value = event.target.value.replace(/\D/g, '').slice(0, 9);
  newSite.value.phone = value;
  event.target.value = value;
  phoneTouched.value = true;
};

const onTextInput = (event, field) => {
  const value = event.target.value.replace(/[0-9]/g, '');
  newSite.value[field] = value;
  event.target.value = value;
};

</script>

<template>
  <section class="p-4">
    <div class="flex justify-content-between align-items-center mb-4">
      <h1 class="sl-page-title">{{ t('sites.list.title') }}</h1>
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
        class="sl-table"
    >
      <pv-column field="name"    :header="t('sites.list.name')" />
      <pv-column field="address" :header="t('sites.list.address')" />
      <pv-column field="phone"   :header="t('sites.detail.contactPhone')" />

      <pv-column :header="t('sites.list.information')">
        <template #body="{ data }">
          <RouterLink :to="{ name: 'site-detail', params: { siteId: data.id } }">
            <pv-button icon="pi pi-eye" text rounded severity="info" v-tooltip.top="t('sites.detail.view')" />
          </RouterLink>
        </template>
      </pv-column>

      <template #empty>{{ t('sites.list.empty') }}</template>
    </pv-data-table>

    <div v-if="errors.length" class="sl-error-bar mt-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>

    <!-- Dialog -->
    <pv-dialog
        v-model:visible="displayNewSiteDialog"
        :header="t('sites.new.title')"
        :modal="true"
        class="p-fluid"
        style="width: 50vw"
    >
      <div v-if="serverError" class="sl-server-error mb-3">
        <i class="pi pi-exclamation-triangle" />
        <span>{{ serverError }}</span>
      </div>

      <form @submit.prevent="saveNewSite" class="flex flex-column gap-4">
        <div class="formgrid grid row-gap-3">

          <div class="field col-12 md:col-6 mt-4">
            <pv-float-label>
              <pv-input-text id="site-name" :value="newSite.name" @input="onTextInput($event, 'name')" class="w-full" required />
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
              <pv-input-text id="contact-name" :value="newSite.contactName" @input="onTextInput($event, 'contactName')" class="w-full" required />
              <label for="contact-name">{{ t('sites.new.contact-name') }}</label>
            </pv-float-label>
          </div>

          <div class="field col-12 md:col-6">
            <pv-float-label>
              <pv-input-text
                  id="phone"
                  :value="newSite.phone"
                  @input="onPhoneInput"
                  class="w-full"
                  maxlength="9"
                  inputmode="numeric"
                  :invalid="phoneTouched && newSite.phone.length < 9"
              />
              <label for="phone">{{ t('sites.new.phone') }}</label>
            </pv-float-label>
            <small v-if="phoneTouched && newSite.phone.length < 9" class="sl-field-hint sl-field-hint--error">
              <i class="pi pi-exclamation-triangle" style="font-size:11px" />
              {{ t('sites.new.phone-invalid') }}
            </small>
            <small v-else class="sl-field-hint">9 digits only</small>
          </div>
        </div>

        <pv-button
            label="Usar mi ubicación actual"
            icon="pi pi-map-marker"
            severity="info"
            text
            type="button"
            @click="getCurrentLocation"
        />

        <div v-if="showMap" class="sl-map-section">
          <MapLocationPicker
              :current-location="currentLocation"
              @location-selected="handleLocationSelected"
          />
        </div>
      </form>

      <template #footer>
        <pv-button :label="t('common.cancel')" icon="pi pi-times" @click="displayNewSiteDialog = false" class="p-button-text" />
        <pv-button :label="t('sites.new.register')" icon="pi pi-check" @click="saveNewSite" :disabled="!isFormValid" />
      </template>
    </pv-dialog>
  </section>
</template>

<style scoped>
.sl-page-title {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--text-color);
  letter-spacing: -0.01em;
  margin: 0;
}

/* Table */
.sl-table :deep(.p-datatable-thead > tr > th) {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-color-secondary);
  background: var(--surface-ground);
  border-bottom: 0.5px solid var(--surface-border);
}

.sl-table :deep(.p-datatable-tbody > tr > td) {
  font-size: 13px;
  border-bottom: 0.5px solid var(--surface-border);
  padding: 0.65rem 1rem;
}

.sl-table :deep(.p-datatable-tbody > tr) {
  transition: background 0.12s;
}

/* Error bar */
.sl-error-bar {
  font-size: 13px;
  color: #A32D2D;
}

/* Server error banner */
.sl-server-error {
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

/* Field hints */
.sl-field-hint {
  display: block;
  font-size: 11px;
  color: var(--text-color-secondary);
  opacity: 0.7;
  margin-top: 4px;
}
.sl-field-hint--error {
  color: #A32D2D;
  opacity: 1;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Map */
.sl-map-section {
  height: 400px;
  width: 100%;
  margin-top: 0.5rem;
  border-radius: 10px;
  overflow: hidden;
  border: 0.5px solid var(--surface-border);
}
</style>