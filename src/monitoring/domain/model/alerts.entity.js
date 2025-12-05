export class Alert {
    /**
     * Creates a new Alert instance.
     */
    constructor({
                    id,
                    tenantId,
                    equipmentId,
                    siteId,
                    type,
                    severity,
                    message,
                    status,
                    createdAt,
                    acknowledgedAt,
                    resolvedAt,
                    closedAt,
                    acknowledgedBy,
                    resolvedBy,
                    createdBy,
                }) {
        this.id = id;
        this.tenantId = tenantId;
        this.equipmentId = equipmentId;
        this.siteId = siteId;
        this.type = type;
        this.severity = severity;
        this.message = message;
        this.status = status;
        this.createdAt = createdAt;
        this.acknowledgedAt = acknowledgedAt;
        this.resolvedAt = resolvedAt;
        this.closedAt = closedAt;
        this.acknowledgedBy = acknowledgedBy;
        this.resolvedBy = resolvedBy;
        this.createdBy = createdBy;
    }
}

