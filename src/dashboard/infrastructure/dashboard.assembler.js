import { DashboardSnapshot } from '@/dashboard/domain/entities/dashboard-snapshot.entity.js'
import { AlertView } from '@/dashboard/domain/entities/alert-view.entity.js'

export class DashboardAssembler {
    static toEntityFromResource(resource) {
        if (!resource) return null

        return new DashboardSnapshot({
            id: resource.id,
            tenantId: resource.tenantId,
            updatedAt: resource.updatedAt,
            kpis: resource.kpis,
            trends: resource.trends
        })
    }

    static toEntitiesFromResponse(response) {
        const data = response?.data
        if (!Array.isArray(data)) {
            return []
        }

        return data
            .map(resource => this.toEntityFromResource(resource))
            .filter(entity => entity !== null)
    }

    static toAlertView(alertData, equipmentName, siteName) {
        return new AlertView({
            id: alertData.id,
            createdAt: alertData.createdAt,
            equipmentId: alertData.equipmentId,
            siteId: alertData.siteId,
            severity: alertData.severity,
            status: alertData.status,
            equipmentName,
            siteName
        })
    }
}
