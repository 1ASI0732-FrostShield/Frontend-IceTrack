import { Intervention } from './intervention.entity.js';

export class ServiceRequest {
    constructor({
                    id,
                    ownerId = null,
                    requesterId,
                    siteId,
                    equipmentId,
                    assignedTo,
                    origin,
                    type,
                    priority,
                    description,
                    status,
                    createdAt,
                    completedAt,
                    canceledAt,
                    technicianId,
                    // Enriched data
                    siteName = 'N/A',
                    equipmentName = 'N/A',
                    requesterName = 'N/A',
                    assignedToName = 'N/A',
                    technicianName = null,
                    hasReview = false,
                    reviewId = null,
                    orderNumber = 0,
                    interventions = []
                }) {
        this.id = id;
        this.ownerId = ownerId;
        this.requesterId = requesterId;
        this.siteId = siteId;
        this.equipmentId = equipmentId;
        this.assignedTo = assignedTo;
        this.origin = origin;
        this.type = type;
        this.priority = priority;
        this.description = description;
        this.status = status;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
        this.canceledAt = canceledAt;
        this.technicianId = technicianId;
        this.siteName = siteName;
        this.equipmentName = equipmentName;
        this.requesterName = requesterName;
        this.assignedToName = assignedToName;
        this.technicianName = technicianName;
        this.hasReview = hasReview;
        this.reviewId = reviewId;
        this.orderNumber = orderNumber;
        this.interventions = interventions.map(i => new Intervention(i));
    }
}
