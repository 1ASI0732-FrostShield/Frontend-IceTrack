<script setup>
import { onMounted, computed } from 'vue'
import { useDashboardConfigStore } from '@/dashboard/application/dashboard-config.store.js'
import { useDashboardDataStore } from '@/dashboard/application/dashboard-data.store.js'
import DashboardConfigTable from '../components/dashboard-config-table.vue'

const configStore = useDashboardConfigStore()
const dataStore = useDashboardDataStore()

/**
 * Load dashboard on mount
 * Follows professor's pattern: no async/await in components
 */
onMounted(() => {
  loadDashboard()
})

/**
 * Load all dashboard data in sequence
 */
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

/**
 * Refresh dashboard data
 */
function refreshDashboard() {
  dataStore.loadAll(configStore.defaultSiteId)
}

/**
 * Get visible cards from configuration
 */
const visibleCards = computed(() => {
  if (!configStore.config) return []
  return configStore.visibleCards
})

/**
 * Get KPI value for a specific card type
 * @param {string} cardType - The card type
 * @returns {string|number} The KPI value
 */
function getKpiValue(cardType) {
  if (!dataStore.kpis) return '--'

  const kpiMap = {
    'MonitoredEquipment': dataStore.kpis.totalEquipments ?? 0,
    'OpenAlerts': dataStore.kpis.openAlerts ?? 0,
    'ActiveOrders': dataStore.kpis.activeRequests ?? 0,
    'AverageTemperature': dataStore.kpis.avgTemperature !== null && dataStore.kpis.avgTemperature !== undefined
        ? dataStore.kpis.getFormattedAvgTemp()
        : '--',
    'RecentReports': 0,
    'EquipmentStatus': 0,
    'SystemHealth': '--'
  }

  return kpiMap[cardType] ?? '--'
}

/**
 * Get icon for a specific card type
 */
function getCardIcon(cardType) {
  const iconMap = {
    'MonitoredEquipment': 'pi-sitemap',
    'OpenAlerts': 'pi-exclamation-triangle',
    'ActiveOrders': 'pi-briefcase',
    'AverageTemperature': 'pi-chart-scatter',
    'TemperatureTrends': 'pi-chart-line',
    'RecentReports': 'pi-file',
    'EquipmentStatus': 'pi-server',
    'SystemHealth': 'pi-heart'
  }
  return iconMap[cardType] || 'pi-th-large'
}

/**
 * Get color for a specific card type
 */
function getCardColor(cardType) {
  const colorMap = {
    'MonitoredEquipment': 'text-primary',
    'OpenAlerts': 'text-orange-500',
    'ActiveOrders': 'text-green-500',
    'AverageTemperature': 'text-blue-500',
    'RecentReports': 'text-purple-500',
    'EquipmentStatus': 'text-cyan-500',
    'SystemHealth': 'text-teal-500'
  }
  return colorMap[cardType] || 'text-gray-500'
}

/**
 * Get title for a specific card type
 */
function getCardTitle(cardType) {
  const titleMap = {
    'MonitoredEquipment': 'Monitored Equipment',
    'OpenAlerts': 'Open Alerts',
    'ActiveOrders': 'Active Orders',
    'AverageTemperature': 'Average Temperature',
    'TemperatureTrends': 'Temperature Trends',
    'RecentReports': 'Recent Reports',
    'EquipmentStatus': 'Equipment Status',
    'SystemHealth': 'System Health'
  }
  return titleMap[cardType] || cardType
}

/**
 * Get subtitle for a specific card type
 */
function getCardSubtitle(cardType) {
  const subtitleMap = {
    'MonitoredEquipment': 'Total equipment being tracked',
    'OpenAlerts': 'Alerts requiring attention',
    'ActiveOrders': 'Service requests in progress',
    'AverageTemperature': 'Current average temperature',
    'RecentReports': 'Reports generated recently',
    'EquipmentStatus': 'Equipment health status',
    'SystemHealth': 'Overall system status'
  }
  return subtitleMap[cardType] || 'Dashboard metric'
}

/**
 * Get only KPI cards (filter out chart cards)
 */
const kpiCards = computed(() => {
  return visibleCards.value.filter(card =>
      card.cardType !== 'TemperatureTrends'
  )
})

/**
 * Check if we have any data loaded
 */
const hasAnyData = computed(() => {
  return dataStore.kpis !== null
})
</script>

<template>
  <div class="p-3">
    <!-- Header -->
    <div class="flex align-items-center justify-content-between mb-4">
      <div>
        <h1 class="text-3xl font-bold m-0">Dashboard</h1>
        <p class="text-500 mt-1">Monitor your equipment and alerts</p>
      </div>
      <pv-button
          icon="pi pi-refresh"
          label="Refresh"
          @click="refreshDashboard"
          :loading="dataStore.loading"
          outlined
      />
    </div>

    <!-- Loading State -->
    <div v-if="configStore.loading && !configStore.config" class="text-center p-5">
      <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
      <p class="mt-3 text-600">Loading dashboard...</p>
    </div>

    <!-- Error Display -->
    <div v-if="configStore.errors.length > 0 || dataStore.errors.length > 0" class="mb-3">
      <pv-card>
        <template #content>
          <div class="flex align-items-start gap-3">
            <i class="pi pi-exclamation-triangle text-red-500 text-2xl"></i>
            <div class="flex-1">
              <div class="font-semibold text-lg mb-2">Errors Occurred</div>
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

    <!-- Dashboard Content -->
    <template v-if="configStore.config && !configStore.loading">

      <!-- KPI Cards -->
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
                  <span>Loading data...</span>
                </div>
                <div v-else-if="!hasAnyData" class="text-xs text-orange-500 flex align-items-center gap-1">
                  <i class="pi pi-exclamation-circle"></i>
                  <span>No data available</span>
                </div>
              </div>
            </template>
          </pv-card>
        </div>
      </div>

      <!-- No Cards Message -->
      <div v-if="kpiCards.length === 0" class="mb-4">
        <pv-card>
          <template #content>
            <div class="text-center p-4">
              <i class="pi pi-inbox text-6xl text-400 mb-3"></i>
              <div class="text-xl font-semibold mb-2">No Cards Visible</div>
              <p class="text-600 mb-3">You haven't added any cards to your dashboard yet.</p>
              <p class="text-500 mb-4">Use the configuration panel below to add cards.</p>
            </div>
          </template>
        </pv-card>
      </div>

      <!-- Dashboard Configuration CRUD Table -->
      <dashboard-config-table v-if="configStore.config" :config="configStore.config" />
    </template>
  </div>
</template>