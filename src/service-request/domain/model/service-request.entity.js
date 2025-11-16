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
                    priority = 'medium',
                    description = '',
                    status = 'pending',
                    createdAt = null,
                    scheduledFor = null,
                    startedAt = null,
                    completedAt = null,
                    canceledAt = null,
                    assignedTo = null,
                    technicianId = null,
                    // Assembled properties
                    siteName = '',
                    equipmentName = '',
                    requesterName = '',
                    assignedToName = '',
                    technicianName = null,
                    reportUrl = null,
                    // Review properties
                    hasReview = false,
                    reviewId = null
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
        this.technicianId = technicianId;

        // Assembled properties
        this.siteName = siteName;
        this.equipmentName = equipmentName;
        this.requesterName = requesterName;
        this.assignedToName = assignedToName;
        this.technicianName = technicianName;
        this.reportUrl = reportUrl;

        // Review properties
        this.hasReview = hasReview;
        this.reviewId = reviewId;
    }
}