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
  <div class="p-3">

    <!-- Header -->
    <div class="flex align-items-center justify-content-between mb-4">
      <div>
        <h1 class="text-3xl font-bold m-0">{{ t('dashboard.title') }}</h1>
        <p class="text-500 mt-1">{{ t('dashboard.subtitle') }}</p>
        <small v-if="configStore.defaultSiteId" class="text-400">
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

    <template v-if="!configStore.loading || configStore.config">
      <div class="grid mb-4">
        <div v-for="card in kpiCards" :key="card.key" class="col-12 md:col-6 lg:col-4" >
          <pv-card
              class="h-full cursor-pointer"
              @click="card.route && router.push(card.route)"
          >
            <template #title>
              <div class="flex align-items-center justify-content-between w-full">
                <span class="text-lg">{{ card.label }}</span>
                <i :class="`pi ${card.icon} text-xl`"></i>
              </div>
            </template>
            <template #content>
              <div class="flex flex-column gap-2">
                <div class="text-4xl font-bold" :class="card.color">
                  <i v-if="dataStore.loading" class="pi pi-spin pi-spinner"></i>
                  <span v-else>{{ card.value }}</span>
                </div>
                <div class="text-sm text-500">{{ card.sublabel }}</div>
              </div>
            </template>
          </pv-card>
        </div>
      </div>

      <div class="grid">

        <!-- Equipment status cards -->
        <div class="col-12 md:col-6 lg:col-3">
          <div class="flex flex-column gap-5" style="height: 22rem">
            <div v-for="card in equipmentStatusCards" :key="card.key" class="flex-1">
              <pv-card
                  class="h-full cursor-pointer"
                  @click="router.push('/services')"
              >
                <template #title>
                  <div class="flex align-items-center justify-content-between w-full">
                    <div class="flex flex-column gap-1">
                      <span class="font-bold text-lg">{{ card.label }}</span>
                      <span class="text-sm font-normal text-500">{{ card.sublabel }}</span>
                    </div>
                    <i :class="['pi', card.icon, 'text-3xl', card.color]"></i>
                  </div>
                </template>
                <template #content>
                  <div class="flex align-items-center justify-content-between">
                    <div class="text-3xl font-bold" :class="card.color">
                      <i v-if="dataStore.loading" class="pi pi-spin pi-spinner text-xl"></i>
                      <span v-else>{{ card.value }}</span>
                    </div>
                  </div>
                </template>
              </pv-card>
            </div>
          </div>
        </div>

        <div class="col-12 md:col-6 lg:col-9">
          <pv-card class="h-full">
            <template #title>
              <div class="flex align-items-center gap-2">
                <i class="pi pi-chart-pie text-xl text-primary"></i>
                <span>{{ t('services.requests.title') }}</span>
              </div>
            </template>
            <template #content>
              <div v-if="dataStore.loading" class="flex justify-content-center align-items-center" style="height: 260px">
                <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
              </div>
              <div v-else style="height: 260px">
                <pv-chart type="doughnut" :data="requestChartData" :options="chartOptions" style="height: 100%" />
              </div>
            </template>
          </pv-card>
        </div>
      </div>
    </template>
  </div>
</template>