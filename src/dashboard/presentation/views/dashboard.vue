<script setup>
import { onMounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardConfigStore } from '@/dashboard/application/dashboard-config.store.js'
import { useDashboardDataStore } from '@/dashboard/application/dashboard-data.store.js'
import DashboardConfigTable from '../components/dashboard-config-table.vue'

const { t } = useI18n()
const configStore = useDashboardConfigStore()
const dataStore = useDashboardDataStore()

onMounted(() => {
  loadDashboard()
})

watch(
    () => configStore.config?.cards,
    (newCards, oldCards) => {
      if (oldCards && newCards && newCards.length !== oldCards.length) {
        console.log('Cards changed, refreshing dashboard...')
        refreshDashboard()
      }
    },
    { deep: true }
)

function loadDashboard() {
  configStore.loadConfigForCurrentUser()
      .then(() => {
        configStore.loadAvailableCardTypes()
        return dataStore.loadAll(configStore.defaultSiteId)
      })
      .catch(error => {
        console.error('Error loading dashboard:', error)
      })
}

function refreshDashboard() {
  dataStore.loadAll(configStore.defaultSiteId)
}

const visibleCards = computed(() => {
  if (!configStore.config) return []
  return configStore.visibleCards
})

function getKpiValue(cardType) {
  if (!dataStore.kpis) return '--'

  const kpiMap = {
    'MonitoredEquipment': dataStore.kpis.totalEquipments ?? 0,
  }

  return kpiMap[cardType] ?? '--'
}

function getCardIcon(cardType) {
  const iconMap = {
    'MonitoredEquipment': 'pi-sitemap',
    'OpenAlerts': 'pi-exclamation-triangle'
  }
  return iconMap[cardType] || 'pi-th-large'
}

function getCardColor(cardType) {
  const colorMap = {
    'MonitoredEquipment': 'text-primary',
    'OpenAlerts': 'text-orange-500'
  }
  return colorMap[cardType] || 'text-gray-500'
}

function getCardTitle(cardType) {
  const titleMap = {
    'MonitoredEquipment': t('dashboard.kpis.equipments'),
    'OpenAlerts': t('dashboard.kpis.alerts')
  }
  return titleMap[cardType] || cardType
}

function getCardSubtitle(cardType) {
  const subtitleMap = {
    'MonitoredEquipment': t('dashboard.configCardSubtitles.monitoredEquipment'),
    'OpenAlerts': t('dashboard.configCardSubtitles.openAlerts')
  }
  return subtitleMap[cardType] || t('dashboard.configCardSubtitles.default')
}

const kpiCards = computed(() => {
  return visibleCards.value
})

const hasAnyData = computed(() => {
  return dataStore.kpis !== null
})
</script>

<template>
  <div class="p-3">
    <div class="flex align-items-center justify-content-between mb-4">
      <div>
        <h1 class="text-3xl font-bold m-0">{{ t('dashboard.title') }}</h1>
        <p class="text-500 mt-1">{{ t('dashboard.subtitle') }}</p>
        <small v-if="configStore.defaultSiteId" class="text-400">
          {{ t('dashboard.filteredBySite', { id: configStore.defaultSiteId }) }}
        </small>
        <small v-else class="text-400">
          {{ t('dashboard.showingAllSites') }}
        </small>
      </div>
      <pv-button
          icon="pi pi-refresh"
          :label="t('dashboard.refresh')"
          @click="refreshDashboard"
          :loading="dataStore.loading"
          outlined
      />
    </div>

    <div v-if="configStore.loading && !configStore.config" class="text-center p-5">
      <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
      <p class="mt-3 text-600">{{ t('dashboard.loading') }}</p>
    </div>

    <div v-if="configStore.errors.length > 0 || dataStore.errors.length > 0" class="mb-3">
      <pv-card>
        <template #content>
          <div class="flex align-items-start gap-3">
            <i class="pi pi-exclamation-triangle text-red-500 text-2xl"></i>
            <div class="flex-1">
              <div class="font-semibold text-lg mb-2">{{ t('dashboard.errors.title') }}</div>
              <ul class="m-0 pl-3">
                <li v-for="(error, idx) in [...configStore.errors, ...dataStore.errors]" :key="idx" class="text-red-600 mb-1">
                  {{ error }}
                </li>
              </ul>
            </div>
            <pv-button
                icon="pi pi-times"
                text
                rounded
                severity="danger"
                @click="configStore.clearErrors(); dataStore.clearErrors()"
            />
          </div>
        </template>
      </pv-card>
    </div>

    <template v-if="configStore.config && !configStore.loading">
      <div v-if="kpiCards.length > 0" class="grid mb-4">
        <div v-for="card in kpiCards" :key="card.id" class="col-12 md:col-6 lg:col-3">
          <pv-card class="h-full">
            <template #title>
              <div class="flex align-items-center justify-content-between w-full">
                <span class="text-lg">{{ getCardTitle(card.cardType) }}</span>
                <i :class="`pi ${getCardIcon(card.cardType)}`" class="text-xl"></i>
              </div>
            </template>
            <template #content>
              <div class="flex flex-column gap-2">
                <div class="text-4xl font-bold" :class="getCardColor(card.cardType)">
                  {{ getKpiValue(card.cardType) }}
                </div>
                <div class="text-sm text-500">
                  {{ getCardSubtitle(card.cardType) }}
                </div>
                <div v-if="dataStore.loading" class="text-xs text-400 flex align-items-center gap-1">
                  <i class="pi pi-spin pi-spinner"></i>
                  <span>{{ t('dashboard.loadingData') }}</span>
                </div>
                <div v-else-if="!hasAnyData" class="text-xs text-orange-500 flex align-items-center gap-1">
                  <i class="pi pi-exclamation-circle"></i>
                  <span>{{ t('dashboard.noData') }}</span>
                </div>
              </div>
            </template>
          </pv-card>
        </div>
      </div>

      <div v-if="kpiCards.length === 0" class="mb-4">
        <pv-card>
          <template #content>
            <div class="text-center p-4">
              <i class="pi pi-inbox text-6xl text-400 mb-3"></i>
              <div class="text-xl font-semibold mb-2">{{ t('dashboard.noCardsVisible') }}</div>
              <p class="text-600 mb-3">{{ t('dashboard.noCardsAdded') }}</p>
              <p class="text-500 mb-4">{{ t('dashboard.useConfigPanel') }}</p>
            </div>
          </template>
        </pv-card>
      </div>

      <dashboard-config-table v-if="configStore.config" :config="configStore.config" />
    </template>
  </div>
</template>
