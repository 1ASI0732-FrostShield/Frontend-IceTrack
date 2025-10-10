import { reactive } from 'vue'
import { dashboardService } from './dashboard.service.js'

const DEMO_TENANT_ID_DEFAULT = 't2'

export const dashboardStore = reactive({
    tenantId: null,
    snapshot: null,
    alerts: [],
    statistics: {},

    loading: false,
    loadingAlerts: false,
    errors: [],

    initFromUrlOrDefault() {
        this.tenantId = dashboardService.getTenantFromUrl(DEMO_TENANT_ID_DEFAULT)
    },

    async loadSnapshot() {
        this.errors = []
        this.loading = true

        try {
            this.snapshot = await dashboardService.loadSnapshot(this.tenantId)

            if (this.snapshot) {
                this.statistics = dashboardService.calculateStatistics(this.snapshot)
            }
        } catch (error) {
            this.errors.push(error.message)
            this.snapshot = null
            this.statistics = {}
        } finally {
            this.loading = false
        }
    },

    async loadRecentAlerts() {
        this.loadingAlerts = true

        try {
            this.alerts = await dashboardService.loadRecentAlertsEnriched(this.tenantId, 5)
        } catch (error) {
            this.errors.push(error.message)
            this.alerts = []
        } finally {
            this.loadingAlerts = false
        }
    },

    async loadAll() {
        this.initFromUrlOrDefault()

        await Promise.all([
            this.loadSnapshot(),
            this.loadRecentAlerts()
        ])
    },

    hasValidChartData() {
        return dashboardService.hasValidChartData(this.snapshot)
    },

    clearErrors() {
        this.errors = []
    },

    async switchTenant(newTenantId) {
        if (this.tenantId !== newTenantId) {
            this.tenantId = newTenantId
            await this.loadAll()
        }
    }
})
