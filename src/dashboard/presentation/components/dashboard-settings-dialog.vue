<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardConfigStore } from '@/dashboard/application/dashboard-config.store.js'
import useAssetsManagementStore from '@/assets-management/application/assets-management.store.js'

const { t } = useI18n()
const configStore = useDashboardConfigStore()
const sitesStore = useAssetsManagementStore()

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  }
})

// Emits
const emit = defineEmits(['update:visible', 'saved'])

// Local state
const selectedSiteId = ref(null)
const temperatureRange = ref('-20 to 5')
const saving = ref(false)

// Watch for visibility changes to load data
watch(() => props.visible, (newVal) => {
  if (newVal) {
    loadCurrentSettings()
    if (!sitesStore.sitesLoaded) {
      sitesStore.fetchSites()
    }
  }
})

// Load current settings
function loadCurrentSettings() {
  if (configStore.config) {
    selectedSiteId.value = configStore.config.defaultSiteId
    temperatureRange.value = configStore.config.defaultTemperatureRange
  }
}

// Save settings
async function saveSettings() {
  saving.value = true

  const success = await configStore.updateConfig({
    defaultSiteId: selectedSiteId.value,
    defaultTemperatureRange: temperatureRange.value
  })

  saving.value = false

  if (success) {
    emit('saved')
    closeDialog()
  }
}

// Close dialog
function closeDialog() {
  emit('update:visible', false)
}
</script>

<template>
  <pv-dialog
      :visible="visible"
      :header="t('dashboard.settings.title')"
      modal
      :style="{ width: '500px' }"
      @update:visible="emit('update:visible', $event)"
  >
    <div class="flex flex-column gap-4 py-3">
      <!-- Default Site Selection -->
      <div class="flex flex-column gap-2">
        <label for="defaultSite" class="font-semibold">
          {{ t('dashboard.settings.defaultSite') }}
        </label>
        <pv-dropdown
            id="defaultSite"
            v-model="selectedSiteId"
            :options="sitesStore.sites"
            option-label="name"
            option-value="id"
            :placeholder="t('dashboard.settings.selectSite')"
            :loading="!sitesStore.sitesLoaded"
            show-clear
            class="w-full"
        />
        <small class="text-500">
          {{ t('dashboard.settings.defaultSiteHelp') }}
        </small>
      </div>

      <!-- Temperature Range -->
      <div class="flex flex-column gap-2">
        <label for="tempRange" class="font-semibold">
          {{ t('dashboard.settings.temperatureRange') }}
        </label>
        <pv-input-text
            id="tempRange"
            v-model="temperatureRange"
            :placeholder="t('dashboard.settings.temperatureRangePlaceholder')"
            class="w-full"
        />
        <small class="text-500">
          {{ t('dashboard.settings.temperatureRangeHelp') }}
        </small>
      </div>

      <!-- Errors -->
      <div v-if="configStore.errors.length > 0" class="p-3 surface-100 border-round border-1 border-red-500">
        <ul class="m-0 pl-3">
          <li v-for="(error, idx) in configStore.errors" :key="idx" class="text-red-600">
            {{ error }}
          </li>
        </ul>
      </div>
    </div>

    <template #footer>
      <pv-button
          :label="t('common.cancel')"
          text
          severity="secondary"
          @click="closeDialog"
          :disabled="saving"
      />
      <pv-button
          :label="t('common.save')"
          @click="saveSettings"
          :loading="saving"
      />
    </template>
  </pv-dialog>
</template>

<style scoped>
</style>