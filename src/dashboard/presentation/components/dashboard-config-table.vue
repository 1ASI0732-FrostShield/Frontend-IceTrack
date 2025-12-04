<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardConfigStore } from '@/dashboard/application/dashboard-config.store.js'
import useAssetsManagementStore from '@/assets-management/application/assets-management.store.js'

const { t } = useI18n()
const configStore = useDashboardConfigStore()
const sitesStore = useAssetsManagementStore()

const props = defineProps({
  config: {
    type: Object,
    required: true
  }
})

const settingsDialogVisible = ref(false)
const cardSelectorVisible = ref(false)
const selectedSiteId = ref(null)
const temperatureRange = ref('-20 to 5')
const saving = ref(false)

// Load sites if not loaded
if (!sitesStore.sitesLoaded) {
  sitesStore.fetchSites()
}

// Initialize values
selectedSiteId.value = props.config.defaultSiteId
temperatureRange.value = props.config.defaultTemperatureRange

function openSettings() {
  selectedSiteId.value = props.config.defaultSiteId
  temperatureRange.value = props.config.defaultTemperatureRange
  settingsDialogVisible.value = true
}

async function saveSettings() {
  saving.value = true

  const success = await configStore.updateConfig({
    defaultSiteId: selectedSiteId.value,
    defaultTemperatureRange: temperatureRange.value
  })

  saving.value = false

  if (success) {
    settingsDialogVisible.value = false
  }
}

function openCardSelector() {
  cardSelectorVisible.value = true
}

async function addCard(cardType) {
  const nextOrder = props.config.cards.length + 1
  const success = await configStore.addCard(cardType, nextOrder)

  if (success) {
    cardSelectorVisible.value = false
  }
}

function getSeverityByOrder(order) {
  const severities = ['success', 'info', 'warning', 'danger', 'secondary']
  return severities[order % severities.length]
}

function getSiteName(siteId) {
  if (!siteId) return t('dashboard.settings.selectSite')
  const site = sitesStore.sites.find(s => s.id === siteId)
  return site?.name || `Site ${siteId}`
}
</script>

<template>
  <pv-card>
    <template #title>
      <div class="flex align-items-center justify-content-between">
        <span>{{ t('dashboard.title') }} - Configuration</span>
        <div class="flex gap-2">
          <pv-button
              :label="t('dashboard.settings.title')"
              icon="pi pi-cog"
              @click="openSettings"
              outlined
          />
          <pv-button
              :label="t('dashboard.addCard.title')"
              icon="pi pi-plus"
              @click="openCardSelector"
              severity="success"
          />
        </div>
      </div>
    </template>

    <template #content>
      <!-- Configuration Summary -->
      <div class="grid mb-4">
        <div class="col-12 md:col-4">
          <div class="surface-100 border-round p-3">
            <div class="text-sm text-500 mb-1">User ID</div>
            <div class="text-xl font-semibold">{{ config.userId }}</div>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="surface-100 border-round p-3">
            <div class="text-sm text-500 mb-1">{{ t('dashboard.settings.defaultSite') }}</div>
            <div class="text-xl font-semibold">{{ getSiteName(config.defaultSiteId) }}</div>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="surface-100 border-round p-3">
            <div class="text-sm text-500 mb-1">{{ t('dashboard.settings.temperatureRange') }}</div>
            <div class="text-xl font-semibold">{{ config.defaultTemperatureRange }}</div>
          </div>
        </div>
      </div>

      <!-- Cards Table -->
      <pv-data-table
          :value="config.cards"
          striped-rows
          :paginator="config.cards.length > 5"
          :rows="5"
          :rows-per-page-options="[5, 10, 20]"
      >
        <template #empty>
          <div class="text-center p-4">
            <i class="pi pi-inbox text-4xl text-400 mb-3"></i>
            <p class="text-600">{{ t('dashboard.noCardsAdded') }}</p>
            <pv-button
                :label="t('dashboard.addCard.title')"
                icon="pi pi-plus"
                @click="openCardSelector"
                class="mt-2"
            />
          </div>
        </template>

        <pv-column field="id" header="ID" sortable style="width: 10%">
          <template #body="{ data }">
            <pv-tag :value="data.id" severity="info" />
          </template>
        </pv-column>

        <pv-column field="cardType" header="Card Type" sortable style="width: 30%">
          <template #body="{ data }">
            <div class="flex align-items-center gap-2">
              <i :class="`pi ${data.getIcon()}`"></i>
              <span class="font-semibold">{{ data.cardType }}</span>
            </div>
          </template>
        </pv-column>

        <pv-column field="order" header="Order" sortable style="width: 15%">
          <template #body="{ data }">
            <pv-tag
                :value="`#${data.order}`"
                :severity="getSeverityByOrder(data.order)"
            />
          </template>
        </pv-column>

        <pv-column field="isVisible" header="Visible" sortable style="width: 15%">
          <template #body="{ data }">
            <pv-tag
                :value="data.isVisible ? 'Visible' : 'Hidden'"
                :severity="data.isVisible ? 'success' : 'secondary'"
            />
          </template>
        </pv-column>

        <pv-column header="Actions" style="width: 30%">
          <template #body="{ data }">
            <div class="flex gap-2">
              <pv-button
                  icon="pi pi-eye"
                  rounded
                  text
                  severity="info"
                  v-tooltip="'View Details'"
              />
              <pv-button
                  icon="pi pi-pencil"
                  rounded
                  text
                  severity="warning"
                  v-tooltip="'Edit'"
              />
              <pv-button
                  icon="pi pi-trash"
                  rounded
                  text
                  severity="danger"
                  v-tooltip="'Delete'"
              />
            </div>
          </template>
        </pv-column>
      </pv-data-table>
    </template>
  </pv-card>

  <!-- Settings Dialog -->
  <pv-dialog
      v-model:visible="settingsDialogVisible"
      :header="t('dashboard.settings.title')"
      modal
      :style="{ width: '500px' }"
  >
    <div class="flex flex-column gap-4 py-3">
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
          @click="settingsDialogVisible = false"
          :disabled="saving"
      />
      <pv-button
          :label="t('common.save')"
          @click="saveSettings"
          :loading="saving"
      />
    </template>
  </pv-dialog>

  <!-- Card Selector Dialog -->
  <pv-dialog
      v-model:visible="cardSelectorVisible"
      :header="t('dashboard.addCard.title')"
      modal
      :style="{ width: '500px' }"
  >
    <div class="flex flex-column gap-3 py-3">
      <div v-if="configStore.availableCardTypes.length === 0" class="text-center p-4">
        <i class="pi pi-spin pi-spinner text-4xl"></i>
        <p class="mt-2">Cargando tipos de cards...</p>
      </div>

      <div
          v-for="cardType in configStore.availableCardTypes"
          :key="cardType"
          class="card-option p-3 border-round cursor-pointer transition-colors transition-duration-200"
          :class="{ 'disabled': config.cards.some(c => c.cardType === cardType) }"
          @click="config.cards.some(c => c.cardType === cardType) ? null : addCard(cardType)"
      >
        <div class="flex align-items-center justify-content-between">
          <div class="flex align-items-center gap-3">
            <i class="pi pi-th-large text-2xl"></i>
            <div>
              <div class="font-semibold">{{ cardType }}</div>
              <small class="text-500">{{ t(`dashboard.cardDescriptions.${cardType}`) }}</small>
            </div>
          </div>
          <pv-tag
              v-if="config.cards.some(c => c.cardType === cardType)"
              value="Added"
              severity="success"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <pv-button
          :label="t('common.cancel')"
          text
          @click="cardSelectorVisible = false"
      />
    </template>
  </pv-dialog>
</template>

<style scoped>
.card-option {
  border: 2px solid var(--surface-border);
  background: var(--surface-card);
}

.card-option:not(.disabled):hover {
  border-color: var(--primary-color);
  background: var(--primary-50);
}

.card-option.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>