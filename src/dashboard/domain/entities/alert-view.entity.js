export class AlertView {
    constructor({
                    id,
                    createdAt,
                    equipmentId,
                    siteId,
                    severity,
                    status,
                    equipmentName,
                    siteName
                }) {
        this.id = id
        this.createdAt = createdAt
        this.equipmentId = equipmentId
        this.siteId = siteId
        this.severity = severity
        this.status = status
        this.equipmentName = equipmentName || equipmentId || '-'
        this.siteName = siteName || siteId || '-'
    }
}
