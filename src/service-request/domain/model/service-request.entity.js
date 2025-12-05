import { Intervention } from './intervention.entity.js';

/**
 * @class ServiceRequest
 * @description Represents a service request entity, including all its properties and related data.
 * @author Kenyi Ramirez
 */
export class ServiceRequest {
    /**
     * @constructor
     * @param {object} props - The properties of the service request.
     */
    constructor({
                    id,
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
