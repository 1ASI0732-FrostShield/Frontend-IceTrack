<script setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { useDashboardConfigStore } from '@/dashboard/application/dashboard-config.store.js'
import useAssetsManagementStore from '@/assets-management/application/assets-management.store.js'

const { t } = useI18n()
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
const cardEditDialogVisible = ref(false)
const selectedCard = ref(null)
const selectedSiteId = ref(null)
const temperatureRange = ref('-20 to 5')
const saving = ref(false)

const cardEditForm = ref({
  isVisible: true
})

onMounted(() => {
  if (!sitesStore.sitesLoaded) {
    try {
      const result = sitesStore.fetchSites()
      if (result && typeof result.catch === 'function') {
        result.catch(err => {
          console.warn('Sites not available:', err)
        })
      }
    } catch (err) {
      console.warn('Sites not available:', err)
    }
  }

  if (props.config) {
    selectedSiteId.value = props.config.defaultSiteId
    temperatureRange.value = props.config.defaultTemperatureRange
  }
})

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

function saveSettings() {
  saving.value = true

  configStore.updateConfig({
    defaultSiteId: selectedSiteId.value,
    defaultTemperatureRange: temperatureRange.value
  }).then(success => {
    saving.value = false

    if (success) {
      settingsDialogVisible.value = false
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('dashboard.config.messages.settingsUpdated'),
        life: 3000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: configStore.errors.length > 0 ? configStore.errors[0] : t('dashboard.config.messages.settingsUpdateFailed'),
        life: 3000
      })
    }
  })
}

function openCardSelector() {
  cardSelectorVisible.value = true
}

function addCard(cardType) {
  const nextOrder = props.config.cards.length

  configStore.addCard(cardType, nextOrder).then(success => {
    if (success) {
      cardSelectorVisible.value = false
      toast.add({
        severity: 'success',
        summary: t('common.success'),
        detail: t('dashboard.config.messages.cardAdded', { cardType }),
        life: 3000
      })
    } else {
      toast.add({
        severity: 'error',
        summary: t('common.error'),
        detail: configStore.errors.length > 0 ? configStore.errors[0] : t('dashboard.config.messages.cardAddFailed'),
        life: 3000
      })
    }
  })
}

function editCard(card) {
  selectedCard.value = card
  cardEditForm.value = {
    isVisible: card.isVisible
  }
  cardEditDialogVisible.value = true
}

function saveCardChanges() {
  if (!selectedCard.value) return

  saving.value = true

  configStore.updateCardVisibility(selectedCard.value.id, cardEditForm.value.isVisible)
      .then(success => {
        saving.value = false

        if (success) {
          cardEditDialogVisible.value = false
          selectedCard.value = null
          toast.add({
            severity: 'success',
            summary: t('common.success'),
            detail: t('dashboard.config.messages.cardUpdated'),
            life: 3000
          })
        } else {
          toast.add({
            severity: 'error',
            summary: t('common.error'),
            detail: configStore.errors.length > 0 ? configStore.errors[0] : t('dashboard.config.messages.cardUpdateFailed'),
            life: 3000
          })
        }
      })
}

function deleteCard(card) {
  confirm.require({
    message: t('dashboard.config.confirm.removeMessage', { cardType: card.cardType }),
    header: t('dashboard.config.confirm.removeHeader'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('dashboard.config.confirm.accept'),
    rejectLabel: t('common.cancel'),
    acceptClass: 'p-button-danger',
    accept: () => {
      configStore.removeCard(card.id).then(success => {
        if (success) {
          toast.add({
            severity: 'success',
            summary: t('common.success'),
            detail: t('dashboard.config.messages.cardRemoved', { cardType: card.cardType }),
            life: 3000
          })
        } else {
          toast.add({
            severity: 'error',
            summary: t('common.error'),
            detail: configStore.errors.length > 0 ? configStore.errors[0] : t('dashboard.config.messages.cardRemoveFailed'),
            life: 3000
          })
        }
      })
    }
  })
}

function getSeverityByOrder(order) {
  const severities = ['success', 'info', 'warning', 'danger', 'secondary']
  return severities[order % severities.length]
}

function getSiteName(siteId) {
  if (!siteId) return t('dashboard.config.noSiteSelected')
  const site = sitesStore.sites.find(s => s.id === siteId)
  return site?.name || t('dashboard.config.unnamedSite', { id: siteId })
}
</script>

<template>
  <pv-card>
    <template #title>
      <div class="flex align-items-center justify-content-between">
        <span>{{ t('dashboard.config.title') }}</span>
        <div class="flex gap-2">
          <pv-button
              :label="t('dashboard.config.actions.settings')"
              icon="pi pi-cog"
              @click="openSettings"
              outlined
          />
          <pv-button
              :label="t('dashboard.config.actions.addCard')"
              icon="pi pi-plus"
              @click="openCardSelector"
              severity="success"
          />
        </div>
      </div>
    </template>

    <template #content>
      <div class="grid mb-4">
        <div class="col-12 md:col-4">
          <div class="surface-100 border-round p-3">
            <div class="text-sm text-500 mb-1">{{ t('dashboard.config.fields.userId') }}</div>
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
            <small class="text-500">{{ t('dashboard.config.temperatureRangeNote') }}</small>
          </div>
        </div>
      </div>

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

        <pv-column :field="'id'" :header="t('dashboard.config.table.id')" sortable style="width: 10%">
          <template #body="{ data }">
            <pv-tag :value="data.id" severity="info" />
          </template>
        </pv-column>

        <pv-column :field="'cardType'" :header="t('dashboard.config.table.cardType')" sortable style="width: 40%">
          <template #body="{ data }">
            <div class="flex align-items-center gap-2">
              <i :class="`pi ${data.getIcon()}`"></i>
              <span class="font-semibold">{{ data.cardType }}</span>
            </div>
          </template>
        </pv-column>

        <pv-column :field="'order'" :header="t('dashboard.config.table.order')" sortable style="width: 15%">
          <template #body="{ data }">
            <pv-tag
                :value="`#${data.order}`"
                :severity="getSeverityByOrder(data.order)"
            />
          </template>
        </pv-column>

        <pv-column :field="'isVisible'" :header="t('dashboard.config.table.visible')" sortable style="width: 15%">
          <template #body="{ data }">
            <pv-tag
                :value="t(data.isVisible ? 'dashboard.config.visibility.visible' : 'dashboard.config.visibility.hidden')"
                :severity="data.isVisible ? 'success' : 'secondary'"
                :icon="data.isVisible ? 'pi pi-eye' : 'pi pi-eye-slash'"
            />
          </template>
        </pv-column>

        <pv-column :header="t('dashboard.config.table.actions')" style="width: 20%">
          <template #body="{ data }">
            <div class="flex gap-2">
              <pv-button
                  icon="pi pi-pencil"
                  rounded
                  text
                  severity="info"
                  :tooltip="t('dashboard.config.tooltips.editCard')"
                  @click="editCard(data)"
              />
              <pv-button
                  icon="pi pi-trash"
                  rounded
                  text
                  severity="danger"
                  :tooltip="t('dashboard.config.tooltips.deleteCard')"
                  @click="deleteCard(data)"
              />
            </div>
          </template>
        </pv-column>
      </pv-data-table>
    </template>
  </pv-card>

  <pv-dialog
      v-model:visible="settingsDialogVisible"
      :header="t('dashboard.settings.title')"
      modal
      :style="{ width: '500px' }"
  >
    <div class="flex flex-column gap-4 py-3">
      <div class="flex flex-column gap-2">
        <label for="defaultSite" class="font-semibold">{{ t('dashboard.settings.defaultSite') }}</label>
        <pv-select
            id="defaultSite"
            v-model="selectedSiteId"
            :options="sitesStore.sites"
            option-label="name"
            option-value="id"
            :placeholder="t('dashboard.settings.selectSite')"
            :loading="!sitesStore.sitesLoaded"
            show-clear
            class="w-full"
            :disabled="!sitesStore.sitesLoaded || sitesStore.sites.length === 0"
        />
        <small class="text-500">{{ t('dashboard.settings.defaultSiteHelp') }}</small>
      </div>

      <div class="flex flex-column gap-2">
        <label for="tempRange" class="font-semibold">{{ t('dashboard.settings.temperatureRange') }}</label>
        <pv-input-text
            id="tempRange"
            v-model="temperatureRange"
            :placeholder="t('dashboard.settings.temperatureRangePlaceholder')"
            class="w-full"
        />
        <small class="text-500">{{ t('dashboard.settings.temperatureRangeHelp') }}</small>
      </div>
    </div>

    <template #footer>
      <pv-button :label="t('common.cancel')" text severity="secondary" @click="settingsDialogVisible = false" :disabled="saving" />
      <pv-button :label="t('common.save')" @click="saveSettings" :loading="saving" />
    </template>
  </pv-dialog>

  <pv-dialog
      v-model:visible="cardSelectorVisible"
      :header="t('dashboard.addCard.title')"
      modal
      :style="{ width: '500px' }"
  >
    <div class="flex flex-column gap-3 py-3">
      <div v-if="configStore.availableCardTypes.length === 0" class="text-center p-4">
        <i class="pi pi-spin pi-spinner text-4xl"></i>
        <p class="mt-2">{{ t('dashboard.addCard.loading') }}</p>
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
              <div class="font-semibold">{{ t(`dashboard.cardTypes.${cardType}`) || cardType }}</div>
              <small class="text-500">{{ t('dashboard.addCard.widgetType') }}</small>
            </div>
          </div>
          <pv-tag
              v-if="config.cards.some(c => c.cardType === cardType)"
              :value="t('dashboard.addCard.added')"
              severity="success"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <pv-button :label="t('common.cancel')" text @click="cardSelectorVisible = false" />
    </template>
  </pv-dialog>

  <pv-dialog
      v-model:visible="cardEditDialogVisible"
      :header="t('dashboard.config.editVisibility.title')"
      modal
      :style="{ width: '400px' }"
  >
    <div v-if="selectedCard" class="flex flex-column gap-3 py-3">
      <div class="flex align-items-center gap-3 pb-3 border-bottom-1 surface-border">
        <i :class="`pi ${selectedCard.getIcon()} text-3xl`" :style="{ color: selectedCard.getColor() }"></i>
        <div class="flex-1">
          <div class="font-semibold text-lg">{{ selectedCard.cardType }}</div>
          <small class="text-500">{{ t('dashboard.config.table.order') }}: #{{ selectedCard.order }}</small>
        </div>
      </div>

      <div class="flex flex-column gap-2">
        <label class="font-semibold">{{ t('dashboard.config.visibility.label') }}</label>
        <div class="surface-100 border-round p-3">
          <div class="flex align-items-center justify-content-between">
            <div class="flex align-items-center gap-2">
              <pv-checkbox
                  v-model="cardEditForm.isVisible"
                  :binary="true"
                  input-id="cardVisible"
              />
              <label for="cardVisible" class="cursor-pointer">{{ t('dashboard.config.visibility.showOnDashboard') }}</label>
            </div>
            <pv-tag
                :value="t(cardEditForm.isVisible ? 'dashboard.config.visibility.visible' : 'dashboard.config.visibility.hidden')"
                :severity="cardEditForm.isVisible ? 'success' : 'secondary'"
                :icon="cardEditForm.isVisible ? 'pi pi-eye' : 'pi pi-eye-slash'"
            />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <pv-button
          :label="t('common.cancel')"
          icon="pi pi-times"
          text
          severity="secondary"
          @click="cardEditDialogVisible = false"
          :disabled="saving"
      />
      <pv-button
          :label="t('common.save')"
          icon="pi pi-check"
          @click="saveCardChanges"
          :loading="saving"
      />
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
