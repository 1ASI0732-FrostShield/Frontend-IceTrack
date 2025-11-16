import { ServiceRequest } from "../domain/model/service-request.entity.js";

export class ServiceRequestAssembler {

    static toEntityFromResource(resource, context = {}) {
        const { users = [], sites = [], equipments = [], technicians = [], reviews = [] } = context;

        const site = sites.find(s => s.id === resource.siteId);
        const equipment = equipments.find(e => e.id === resource.equipmentId);
        const requester = users.find(u => u.id === resource.requesterId);
        const provider = users.find(u => u.id === resource.assignedTo);
        const technician = technicians.find(t => t.id === resource.technicianId);

        const serviceReview = reviews.find(r => r.serviceRequestId === resource.id);

        return new ServiceRequest({
            ...resource,
            siteName: site ? site.name : 'N/A',
            equipmentName: equipment ? `${equipment.name} (${equipment.serial})` : 'N/A',
            requesterName: requester ? requester.name : 'N/A',
            assignedToName: provider ? provider.name : 'N/A',
            technicianName: technician ? technician.name : null,
            hasReview: !!serviceReview,
            reviewId: serviceReview ? serviceReview.id : null
        });
    }

    static toEntitiesFromResponse(response, context = {}) {
        if (response.status !== 200) {
            console.error(`Error ${response.status}: ${response.statusText}`);
            return [];
        }

        const resources = Array.isArray(response.data) ? response.data : [];

        return resources.map(resource => this.toEntityFromResource(resource, context));
    }
}