import { ServiceRequest} from "@/service-request/domain/model/service-request.entity.js";

export class ServiceRequestAssembler {
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

    static toEntitiesFromResponse(dtos, context = {}) {
        return dtos.map(dto => this.toEntityFromResource(dto, context));
    }
}
