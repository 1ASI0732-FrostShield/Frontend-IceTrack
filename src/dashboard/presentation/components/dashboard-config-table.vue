<script setup>
import { ref, onMounted, watch } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useDashboardConfigStore } from '@/dashboard/application/dashboard-config.store.js'
import useAssetsManagementStore from '@/assets-management/application/assets-management.store.js'

const confirm = useConfirm()
const toast = useToast()
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
const cardDetailDialogVisible = ref(false)
const selectedCard = ref(null)
const selectedSiteId = ref(null)
const temperatureRange = ref('-20 to 5')
const saving = ref(false)

onMounted(() => {
  // Cargar sites solo si no están cargados (sin .catch porque no retorna Promise)
  if (!sitesStore.sitesLoaded) {
    try {
      sitesStore.fetchSites()
    } catch (err) {
      console.warn('Sites not available:', err)
    }
  }

  // Inicializar valores
  if (props.config) {
    selectedSiteId.value = props.config.defaultSiteId
    temperatureRange.value = props.config.defaultTemperatureRange
  }
})

// Observar cambios en config
watch(() => props.config, (newConfig) => {
  if (newConfig) {
    selectedSiteId.value = newConfig.defaultSiteId
    temperatureRange.value = newConfig.defaultTemperatureRange
  }
}, { immediate: true })

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
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Settings updated successfully',
      life: 3000
    })
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update settings',
      life: 3000
    })
  }
}

function openCardSelector() {
  cardSelectorVisible.value = true
}

async function addCard(cardType) {
  const nextOrder = props.config.cards.length
  const success = await configStore.addCard(cardType, nextOrder)

  if (success) {
    cardSelectorVisible.value = false
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Card "${cardType}" added successfully`,
      life: 3000
    })
  } else {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to add card',
      life: 3000
    })
  }
}

function viewCard(card) {
  selectedCard.value = card
  cardDetailDialogVisible.value = true
}

async function deleteCard(card) {
  confirm.require({
    message: `Are you sure you want to remove "${card.cardType}" from your dashboard?`,
    header: 'Delete Card',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
    accept: async () => {
      const success = await configStore.removeCard(card.id)

      if (success) {
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: `Card "${card.cardType}" removed successfully`,
          life: 3000
        })
      } else {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to remove card',
          life: 3000
        })
      }
    }
  })
}

function getSeverityByOrder(order) {
  const severities = ['success', 'info', 'warning', 'danger', 'secondary']
  return severities[order % severities.length]
}

function getSiteName(siteId) {
  if (!siteId) return 'No site selected'
  const site = sitesStore.sites.find(s => s.id === siteId)
  return site?.name || `Site ${siteId}`
}
</script>

<template>
  <pv-card>
    <template #title>
      <div class="flex align-items-center justify-content-between">
        <span>Dashboard Configuration</span>
        <div class="flex gap-2">
          <pv-button
              label="Settings"
              icon="pi pi-cog"
              @click="openSettings"
              outlined
          />
          <pv-button
              label="Add Card"
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
            <div class="text-sm text-500 mb-1">Default Site</div>
            <div class="text-xl font-semibold">{{ getSiteName(config.defaultSiteId) }}</div>
          </div>
        </div>
        <div class="col-12 md:col-4">
          <div class="surface-100 border-round p-3">
            <div class="text-sm text-500 mb-1">Temperature Range</div>
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
            <p class="text-600">No cards added yet</p>
            <pv-button
                label="Add Card"
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
                :icon="data.isVisible ? 'pi pi-eye' : 'pi pi-eye-slash'"
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
                  @click="viewCard(data)"
              />
              <pv-button
                  icon="pi pi-trash"
                  rounded
                  text
                  severity="danger"
                  v-tooltip="'Delete'"
                  @click="deleteCard(data)"
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
      header="Dashboard Settings"
      modal
      :style="{ width: '500px' }"
  >
    <div class="flex flex-column gap-4 py-3">
      <div class="flex flex-column gap-2">
        <label for="defaultSite" class="font-semibold">Default Site</label>
        <pv-dropdown
            id="defaultSite"
            v-model="selectedSiteId"
            :options="sitesStore.sites"
            option-label="name"
            option-value="id"
            placeholder="Select a site"
            :loading="!sitesStore.sitesLoaded"
            show-clear
            class="w-full"
            :disabled="!sitesStore.sitesLoaded || sitesStore.sites.length === 0"
        />
        <small class="text-500">Default site for filtering dashboard data</small>
        <small v-if="!sitesStore.sitesLoaded || sitesStore.sites.length === 0" class="text-orange-500">
          <i class="pi pi-exclamation-triangle"></i> Sites endpoint not available
        </small>
      </div>

      <div class="flex flex-column gap-2">
        <label for="tempRange" class="font-semibold">Temperature Range</label>
        <pv-input-text
            id="tempRange"
            v-model="temperatureRange"
            placeholder="e.g., -20 to 5"
            class="w-full"
        />
        <small class="text-500">Default temperature range for monitoring</small>
      </div>

      <div v-if="configStore.errors.length > 0" class="p-3 surface-100 border-round border-1 border-red-500">
        <ul class="m-0 pl-3">
          <li v-for="(error, idx) in configStore.errors" :key="idx" class="text-red-600">{{ error }}</li>
        </ul>
      </div>
    </div>

    <template #footer>
      <pv-button label="Cancel" text severity="secondary" @click="settingsDialogVisible = false" :disabled="saving" />
      <pv-button label="Save" @click="saveSettings" :loading="saving" />
    </template>
  </pv-dialog>

  <!-- Card Selector Dialog -->
  <pv-dialog
      v-model:visible="cardSelectorVisible"
      header="Add Card to Dashboard"
      modal
      :style="{ width: '500px' }"
  >
    <div class="flex flex-column gap-3 py-3">
      <div v-if="configStore.availableCardTypes.length === 0" class="text-center p-4">
        <i class="pi pi-spin pi-spinner text-4xl"></i>
        <p class="mt-2">Loading available cards...</p>
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
              <small class="text-500">Dashboard widget type</small>
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
      <pv-button label="Cancel" text @click="cardSelectorVisible = false" />
    </template>
  </pv-dialog>

  <!-- Card Detail Dialog -->
  <pv-dialog
      v-model:visible="cardDetailDialogVisible"
      header="Card Details"
      modal
      :style="{ width: '400px' }"
  >
    <div v-if="selectedCard" class="flex flex-column gap-3 py-3">
      <div class="flex align-items-center gap-3 pb-3 border-bottom-1 surface-border">
        <i :class="`pi ${selectedCard.getIcon()} text-4xl`" :style="{ color: selectedCard.getColor() }"></i>
        <div>
          <div class="font-semibold text-xl">{{ selectedCard.cardType }}</div>
          <small class="text-500">ID: {{ selectedCard.id }}</small>
        </div>
      </div>

      <div class="grid">
        <div class="col-6">
          <div class="text-500 text-sm mb-1">Order</div>
          <div class="font-semibold">#{{ selectedCard.order }}</div>
        </div>
        <div class="col-6">
          <div class="text-500 text-sm mb-1">Visibility</div>
          <pv-tag
              :value="selectedCard.isVisible ? 'Visible' : 'Hidden'"
              :severity="selectedCard.isVisible ? 'success' : 'secondary'"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <pv-button label="Close" text @click="cardDetailDialogVisible = false" />
    </template>
  </pv-dialog>

  <pv-confirm-dialog></pv-confirm-dialog>
  <pv-toast></pv-toast>
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