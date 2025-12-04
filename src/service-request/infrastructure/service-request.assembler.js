import { ServiceRequest } from "../domain/model/service-request.entity.js";

export class ServiceRequestAssembler {

    static toEntityFromResource(resource, context = {}) {
        const { users = [], sites = [], equipments = [], reports = [] } = context;

        const site = sites.find(s => s.id === resource.siteId);
        const equipment = equipments.find(e => e.id === resource.equipmentId);
        const requester = users.find(u => u.id === resource.requesterId);
        const technician = users.find(u => u.id === resource.assignedTo);

        const report = reports.find(r => r.serviceRequestId === resource.id);
        const reportUrl = resource.status === 'done' && report ? report.url : null;

        return new ServiceRequest({
            ...resource,
            siteName: site ? site.name : 'N/A',
            equipmentName: equipment ? `${equipment.name} (${equipment.serial})` : 'N/A',
            requesterName: requester ? requester.name : 'N/A',
            technicianName: technician ? technician.name : null,
            reportUrl: reportUrl
        });
    }

    static toEntitiesFromResponse(response, context = {}) {
        if (response.status !== 200) {
            console.error(`Error ${response.status}: ${response.statusText}`);
            return [];
        }

        let resources = response.data;

        if (!Array.isArray(resources) && resources && resources['serviceRequests']) {
            resources = resources['serviceRequests'];
        }

        if (!Array.isArray(resources)) {
            console.error("Assembler no pudo extraer la lista de Service Requests.");
            return [];
        }

        return resources.map(resource => this.toEntityFromResource(resource, context));
    }
}