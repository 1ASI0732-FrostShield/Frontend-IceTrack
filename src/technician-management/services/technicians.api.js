import { BaseApi } from "@/shared/infrastructure/base-api.js";

const techniciansEndpointPath = '/technicians';

export class TechniciansApi extends BaseApi {
    constructor() {
        super();
    }

    getTechniciansByProvider(providerId) {
        return this.http.get(techniciansEndpointPath, { params: { providerId } });
    }

    createTechnician(resource) {
        return this.http.post(techniciansEndpointPath, resource);
    }

    updateTechnician(id, resource) {
        return this.http.put(`${techniciansEndpointPath}/${id}`, resource);
    }

    deleteTechnician(id) {
        return this.http.delete(`${techniciansEndpointPath}/${id}`);
    }
}
