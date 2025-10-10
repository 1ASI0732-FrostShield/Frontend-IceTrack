export class ServiceRequest {
    constructor({
                    id = null,
                    tenantId = null,
                    siteId = null,
                    equipmentId = null,
                    requesterId = null,
                    origin = 'manual',
                    alertId = null,
                    type = 'corrective',
                    priority = 'medium', // high, medium, low
                    description = '',
                    status = 'pending', // pending, assigned, scheduled, inProgress, done, canceled
                    createdAt = null,
                    scheduledFor = null,
                    startedAt = null,
                    completedAt = null,
                    canceledAt = null,
                    assignedTo = null,
                    siteName = '',
                    equipmentName = '',
                    requesterName = '',
                    technicianName = null,
                    reportUrl = null
                }) {
        this.id = id;
        this.tenantId = tenantId;
        this.siteId = siteId;
        this.equipmentId = equipmentId;
        this.requesterId = requesterId;
        this.origin = origin;
        this.alertId = alertId;
        this.type = type;
        this.priority = priority;
        this.description = description;
        this.status = status;
        this.createdAt = createdAt;
        this.scheduledFor = scheduledFor;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
        this.canceledAt = canceledAt;
        this.assignedTo = assignedTo;

        this.siteName = siteName;
        this.equipmentName = equipmentName;
        this.requesterName = requesterName;
        this.technicianName = technicianName;
        this.reportUrl = reportUrl;
    }
}