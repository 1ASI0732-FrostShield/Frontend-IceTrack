<script setup>
import { onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardConfigStore } from '@/dashboard/application/dashboard-config.store.js'
import { useDashboardDataStore }   from '@/dashboard/application/dashboard-data.store.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const { t }       = useI18n()
const configStore = useDashboardConfigStore()
const dataStore   = useDashboardDataStore()

onMounted(() => {
  configStore.loadConfigForCurrentUser().then(() => {
    dataStore.loadAll(configStore.defaultSiteId).then(() => {
      console.log('requests raw:', dataStore.requests.map(r => r.status))
      console.log('counts:', dataStore.requestStatusCounts)
    })
  })
})

function refresh() {
  dataStore.loadAll(configStore.defaultSiteId)
}

const kpiCards = computed(() => [
  {
    key:      'sites',
    label:    t('dashboard.kpis.sites'),
    sublabel: t('dashboard.configCardSubtitles.monitoredSites'),
    value:    dataStore.kpis?.totalSites      ?? '--',
    icon:     'pi-map-marker',
    color:    'text-teal-500',
    route:    '/sites'
  },
  {
    key:      'equipments',
    label:    t('dashboard.kpis.equipments'),
    sublabel: t('dashboard.configCardSubtitles.monitoredEquipment'),
    value:    dataStore.kpis?.totalEquipments ?? '--',
    icon:     'pi-sitemap',
    color:    'text-primary',
    route:    '/equipments'
  },
  {
    key:      'requests',
    label:    t('dashboard.kpis.orders'),
    sublabel: t('dashboard.configCardSubtitles.activeRequests'),
    value:    dataStore.kpis?.activeRequests  ?? '--',
    icon:     'pi-briefcase',
    color:    'text-green-500',
    route:    '/services'
  },
])

const equipmentStatusCards = computed(() => [
  {
    key:     'maintenance',
    label:   t('dashboard.kpis.maintenance'),
    sublabel: t('dashboard.configCardSubtitles.maintenance'),
    value:   dataStore.equipmentStatusCounts.maintenance,
    icon:    'pi-wrench',
    color:   'text-orange-500',
    severity: 'warning',
    route:    '/services'
  },
  {
    key:     'repair',
    label:   t('dashboard.kpis.repair'),
    value:   dataStore.equipmentStatusCounts.repair,
    sublabel: t('dashboard.configCardSubtitles.repair'),
    icon:    'pi-hammer',
    color:   'text-red-500',
    severity: 'danger',
    route:    '/services'
  },
])

const requestChartData = computed(() => {
  const counts = [
    dataStore.requestStatusCounts.inProgress,
    dataStore.requestStatusCounts.pending,
    dataStore.requestStatusCounts.completed,
    dataStore.requestStatusCounts.canceled,
    dataStore.requestStatusCounts.rejected,
  ]

  const total = counts.reduce((a, b) => a + b, 0)

  if (total === 0) {
    return {
      labels: [t('dashboard.noData')],
      datasets: [{ data: [1], backgroundColor: ['#e5e7eb'], borderWidth: 0 }],
    }
  }

  return {
    labels: [
      t('services.status.inProgress'),
      t('services.status.pending'),
      t('services.status.completed'),
      t('services.status.canceled'),
      t('services.status.rejected'),
    ],
    datasets: [{
      data: counts,
      backgroundColor: ['#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6'],
      borderWidth: 0,
    }],
  }
})

const chartOptions = {
  plugins: {
    legend: {
      position: 'bottom',
      labels: { padding: 16, usePointStyle: true, pointStyleWidth: 10 },
    },
  },
  responsive: true,
  maintainAspectRatio: false,
}
</script>

<template>
  <div class="dash-wrap p-3">

    <!-- Header -->
    <div class="dash-header flex align-items-center justify-content-between mb-5">
      <div>
        <h1 class="dash-title m-0">{{ t('dashboard.title') }}</h1>
        <p class="dash-subtitle mt-1 mb-0">{{ t('dashboard.subtitle') }}</p>
        <small v-if="configStore.defaultSiteId" class="dash-site-filter">
          {{ t('dashboard.filteredBySite', { id: configStore.defaultSiteId }) }}
        </small>
      </div>
      <pv-button
          icon="pi pi-refresh"
          :label="t('dashboard.refresh')"
          @click="refresh"
          :loading="dataStore.loading"
          outlined
      />
    </div>

    <!-- Loading inicial -->
    <div v-if="configStore.loading && !configStore.config" class="dash-loading">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem;" />
    </div>

    <template v-else>

      <!-- KPI Cards -->
      <div class="grid mb-4">
        <div v-for="card in kpiCards" :key="card.key" class="col-12 md:col-6 lg:col-4">
          <pv-card
              class="dash-kpi-card h-full cursor-pointer"
              @click="card.route && router.push(card.route)"
          >
            <template #title>
              <div class="flex align-items-center justify-content-between w-full">
                <span class="dash-kpi-label">{{ card.label }}</span>
                <div class="dash-kpi-icon-wrap" :class="`dash-icon--${card.key}`">
                  <i :class="`pi ${card.icon}`"></i>
                </div>
              </div>
            </template>
            <template #content>
              <div class="flex flex-column gap-2">
                <div class="dash-kpi-value" :class="`dash-value--${card.key}`">
                  <i v-if="dataStore.loading" class="pi pi-spin pi-spinner"></i>
                  <span v-else>{{ card.value }}</span>
                </div>
                <div class="dash-kpi-sublabel">{{ card.sublabel }}</div>
              </div>
            </template>
          </pv-card>
        </div>
      </div>

      <div class="grid">

        <!-- Equipment Status Cards -->
        <div class="col-12 md:col-6 lg:col-3">
          <div class="flex flex-column gap-3 h-full">
            <div v-for="card in equipmentStatusCards" :key="card.key" class="flex-1">
              <pv-card
                  class="dash-status-card h-full cursor-pointer"
                  :class="`dash-status-card--${card.key}`"
                  @click="router.push('/services')"
              >
                <template #title>
                  <div class="flex align-items-center justify-content-between w-full">
                    <div class="flex flex-column gap-1">
                      <span class="dash-status-label">{{ card.label }}</span>
                      <span class="dash-status-sublabel">{{ card.sublabel }}</span>
                    </div>
                    <div class="dash-status-icon-wrap" :class="`dash-status-icon--${card.key}`">
                      <i :class="`pi ${card.icon} text-2xl`"></i>
                    </div>
                  </div>
                </template>
                <template #content>
                  <div class="dash-status-value" :class="`dash-status-value--${card.key}`">
                    <i v-if="dataStore.loading" class="pi pi-spin pi-spinner"></i>
                    <span v-else>{{ card.value }}</span>
                  </div>
                </template>
              </pv-card>
            </div>
          </div>
        </div>

        <!-- Doughnut Chart -->
        <div class="col-12 md:col-6 lg:col-9">
          <pv-card class="dash-chart-card h-full">
            <template #title>
              <div class="flex align-items-center gap-2">
                <div class="dash-chart-icon-wrap">
                  <i class="pi pi-chart-pie"></i>
                </div>
                <span class="dash-chart-title">{{ t('services.requests.title') }}</span>
              </div>
            </template>
            <template #content>
              <div v-if="dataStore.loading" class="dash-chart-loader">
                <i class="pi pi-spin pi-spinner" style="font-size: 2rem;"></i>
              </div>
              <div v-else style="height: 260px">
                <pv-chart
                    type="doughnut"
                    :data="requestChartData"
                    :options="chartOptions"
                    style="height: 100%"
                />
              </div>
            </template>
          </pv-card>
        </div>

      </div>
    </template>
  </div>
</template>

<style scoped>
/* ── Page ── */
.dash-wrap {
  min-height: 100vh;
}

.dash-title {
  font-size: 1.6rem;
  font-weight: 500;
  color: var(--text-color);
  letter-spacing: -0.01em;
}

.dash-subtitle {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.dash-site-filter {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  opacity: 0.7;
}

.dash-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--text-color-secondary);
}

/* ── KPI Cards ── */
.dash-kpi-card {
  transition: transform 0.15s, box-shadow 0.15s;
  border: 0.5px solid var(--surface-border) !important;
}

.dash-kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.07) !important;
}

.dash-kpi-card :deep(.p-card-body) { padding: 1.25rem; }
.dash-kpi-card :deep(.p-card-title) { margin-bottom: 0.5rem; }
.dash-kpi-card :deep(.p-card-content) { padding-top: 0.25rem; }

.dash-kpi-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dash-kpi-value {
  font-size: 2.25rem;
  font-weight: 500;
  line-height: 1;
}

.dash-kpi-sublabel {
  font-size: 0.78rem;
  color: var(--text-color-secondary);
  opacity: 0.75;
}

/* KPI icon bubbles */
.dash-kpi-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.dash-icon--sites      { background: #E1F5EE; color: #0F6E56; }
.dash-icon--equipments { background: #E6F1FB; color: #185FA5; }
.dash-icon--requests   { background: #EAF3DE; color: #3B6D11; }

/* KPI value colors */
.dash-value--sites      { color: #0F6E56; }
.dash-value--equipments { color: #185FA5; }
.dash-value--requests   { color: #3B6D11; }

/* ── Equipment Status Cards ── */
.dash-status-card {
  transition: transform 0.15s, box-shadow 0.15s;
  border: 0.5px solid var(--surface-border) !important;
}

.dash-status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.07) !important;
}

.dash-status-card :deep(.p-card-body)   { padding: 1.1rem 1.25rem; }
.dash-status-card :deep(.p-card-title)  { margin-bottom: 0.25rem; }
.dash-status-card :deep(.p-card-content){ padding-top: 0.25rem; }

.dash-status-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dash-status-sublabel {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
  opacity: 0.65;
  font-weight: 400;
}

.dash-status-value {
  font-size: 2rem;
  font-weight: 500;
  line-height: 1;
}

/* Status icon bubbles */
.dash-status-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dash-status-icon--maintenance { background: #FAEEDA; color: #854F0B; }
.dash-status-icon--repair      { background: #FCEBEB; color: #A32D2D; }

.dash-status-value--maintenance { color: #854F0B; }
.dash-status-value--repair      { color: #A32D2D; }

/* ── Chart Card ── */
.dash-chart-card {
  border: 0.5px solid var(--surface-border) !important;
}

.dash-chart-card :deep(.p-card-body)   { padding: 1.25rem; }
.dash-chart-card :deep(.p-card-title)  { margin-bottom: 0.5rem; }
.dash-chart-card :deep(.p-card-content){ padding-top: 0.25rem; }

.dash-chart-title {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dash-chart-icon-wrap {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #E6F1FB;
  color: #185FA5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.dash-chart-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 260px;
  color: var(--text-color-secondary);
}
</style>
