import {DashboardApi} from '../infrastructure/dashboard.api.js'
import {DashboardAssembler} from '../infrastructure/dashboard.assembler.js'

export class DashboardService {
    constructor() {
        this.api = new DashboardApi()
    }

    async loadSnapshot(tenantId) {
        try {
            console.debug('[DashboardService] Loading snapshot for tenant:', tenantId)

            const response = await this.api.getSnapshotByTenant(tenantId)
            const entities = DashboardAssembler.toEntitiesFromResponse(response)

            if (entities.length === 0) {
                console.warn('[DashboardService] No snapshot found for tenant:', tenantId)
                return null
            }

            const snapshot = entities[0]
            console.debug('[DashboardService] Snapshot loaded:', snapshot)

            return snapshot
        } catch (error) {
            console.error('[DashboardService] Error loading snapshot:', error)
            throw new Error(`Error cargando dashboard: ${error.message}`)
        }
    }

    async loadRecentAlertsEnriched(tenantId, limit = 5) {
        try {
            console.debug('[DashboardService] Loading alerts for tenant:', tenantId, 'limit:', limit)

            const alertsResponse = await this.api.getRecentAlerts(tenantId, limit)
            const alertsRaw = alertsResponse.data || []

            if (alertsRaw.length === 0) {
                console.info('[DashboardService] No alerts found for tenant:', tenantId)
                return []
            }

            const enrichedAlerts = await this.enrichAlerts(alertsRaw)

            console.debug('[DashboardService] Alerts enriched:', enrichedAlerts.length)
            return enrichedAlerts
        } catch (error) {
            console.error('[DashboardService] Error loading alerts:', error)
            throw new Error(`Error cargando alertas: ${error.message}`)
        }
    }

    async enrichAlerts(alertsRaw) {
        const equipmentIds = [...new Set(alertsRaw.map(a => a.equipmentId))].filter(Boolean)
        const siteIds = [...new Set(alertsRaw.map(a => a.siteId))].filter(Boolean)

        console.debug('[DashboardService] Enriching - Equipment IDs:', equipmentIds, 'Site IDs:', siteIds)

        const [equipmentsResponse, sitesResponse] = await Promise.all([
            this.api.getEquipmentsByIds(equipmentIds),
            this.api.getSitesByIds(siteIds)
        ])

        const equipments = equipmentsResponse.data || []
        const sites = sitesResponse.data || []

        const equipmentMap = Object.fromEntries(
            equipments.map(e => [e.id, e.name])
        )
        const siteMap = Object.fromEntries(
            sites.map(s => [s.id, s.name])
        )

        return alertsRaw.map(alert =>
            DashboardAssembler.toAlertView(
                alert,
                equipmentMap[alert.equipmentId] || alert.equipmentId || 'Desconocido',
                siteMap[alert.siteId] || alert.siteId || 'Desconocido'
            )
        )
    }

    calculateStatistics(snapshot) {
        if (!snapshot) {
            return {
                avgTemperature: 0,
                maxTemperature: 0,
                minTemperature: 0,
                totalDataPoints: 0
            }
        }

        const temps = snapshot.trends.temperature.avg || []

        if (temps.length === 0) {
            return {
                avgTemperature: 0,
                maxTemperature: 0,
                minTemperature: 0,
                totalDataPoints: 0
            }
        }

        return {
            avgTemperature: snapshot.avgTemperature,
            maxTemperature: Math.max(...temps),
            minTemperature: Math.min(...temps),
            totalDataPoints: temps.length
        }
    }

    hasValidChartData(snapshot) {
        return snapshot &&
            snapshot.trends &&
            snapshot.trends.temperature &&
            Array.isArray(snapshot.trends.temperature.labels) &&
            Array.isArray(snapshot.trends.temperature.avg) &&
            snapshot.trends.temperature.labels.length > 0 &&
            snapshot.trends.temperature.avg.length > 0
    }

    getTenantFromUrl(defaultTenant = 't2') {
        const params = new URLSearchParams(window.location.search)
        const tenant = params.get('tenant')

        // Validar que sea un tenant válido
        const validTenants = ['t1', 't2'] // Podría venir de configuración

        if (tenant && validTenants.includes(tenant)) {
            return tenant
        }

        return defaultTenant
    }
}

export const dashboardService = new DashboardService()
