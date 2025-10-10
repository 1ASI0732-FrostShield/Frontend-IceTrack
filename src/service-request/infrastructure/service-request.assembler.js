import { ServiceRequest } from "../domain/model/service-request.entity.js";

export class ServiceRequestAssembler {

    static toEntityFromResource(resource, context = {}) {
        const { users = [], sites = [], equipments = [], reports = [] } = context;

        // 1. Obtener nombres de las entidades relacionadas
        const site = sites.find(s => s.id === resource.siteId);
        const equipment = equipments.find(e => e.id === resource.equipmentId);
        const requester = users.find(u => u.id === resource.requesterId);
        const technician = users.find(u => u.id === resource.assignedTo);

        // 2. Obtener la URL del reporte si está completado
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
            console.error(`${response.status}: ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['serviceRequests'];
        return resources.map(resource => this.toEntityFromResource(resource, context));
    }
}