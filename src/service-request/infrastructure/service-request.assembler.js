import { ServiceRequest} from "@/service-request/domain/model/service-request.entity.js";

/**
 * @class ServiceRequestAssembler
 * @description A class for assembling service request entities from data transfer objects (DTOs).
 * @author Kenyi Ramirez
 */
export class ServiceRequestAssembler {
    /**
     * @description Converts a service request DTO to a ServiceRequest entity, enriching it with context data.
     * @param {object} dto - The service request data transfer object.
     * @param {object} context - The context data containing users, sites, equipment, etc.
     * @returns {ServiceRequest} The assembled ServiceRequest entity.
     */
    static toEntityFromResource(dto, context = {}) {
        const { users = [], sites = [], equipments = [], technicians = [], reviews = [] } = context;

        const site = sites.find(s => s.id === dto.siteId);
        const equipment = equipments.find(e => e.id === dto.equipmentId);
        const requester = users.find(u => u.id === dto.requesterId);
        const provider = users.find(u => u.id === dto.assignedTo);
        const technician = technicians.find(t => t.id === dto.technicianId);
        const serviceReview = reviews.find(r => r.serviceRequestId === dto.id);

        return new ServiceRequest({
            ...dto,
            siteName: site ? site.name : 'N/A',
            equipmentName: equipment ? `${equipment.name} (${equipment.serial})` : 'N/A',
            requesterName: requester ? requester.username : 'N/A',
            assignedToName: provider ? provider.username : 'N/A',
            technicianName: technician ? technician.name : null,
            hasReview: !!serviceReview,
            reviewId: serviceReview ? serviceReview.id : null
        });
    }

    /**
     * @description Converts an array of service request DTOs to an array of ServiceRequest entities.
     * @param {Array<object>} dtos - The array of service request DTOs.
     * @param {object} context - The context data.
     * @returns {Array<ServiceRequest>} The array of assembled ServiceRequest entities.
     */
    static toEntitiesFromResponse(dtos, context = {}) {
        return dtos.map(dto => this.toEntityFromResource(dto, context));
    }
}
