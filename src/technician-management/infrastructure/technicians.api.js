import { BaseApi } from "@/shared/infrastructure/base-api.js";

const techniciansEndpointPath = '/technicians';

/**
 * @class TechniciansApi
 * @description A class for interacting with the technicians API.
 * @extends BaseApi
 * @author Kenyi Ramirez
 */
export class TechniciansApi extends BaseApi {
    constructor() {
        super();
    }

    /**
     * @description Get all technicians for a given provider.
     * @param {number} providerId - The ID of the provider.
     * @returns {Promise<object>} A promise that resolves to the API response.
     */
    getTechniciansByProvider(providerId) {
        return this.http.get(techniciansEndpointPath, { params: { providerId } });
    }

    /**
     * @description Create a new technician.
     * @param {object} resource - The technician resource to create.
     * @returns {Promise<object>} A promise that resolves to the API response.
     */
    createTechnician(resource) {
        return this.http.post(techniciansEndpointPath, resource);
    }

    /**
     * @description Update an existing technician.
     * @param {number} id - The ID of the technician to update.
     * @param {object} resource - The updated technician resource.
     * @returns {Promise<object>} A promise that resolves to the API response.
     */
    updateTechnician(id, resource) {
        return this.http.put(`${techniciansEndpointPath}/${id}`, resource);
    }

    /**
     * @description Delete a technician.
     * @param {number} id - The ID of the technician to delete.
     * @returns {Promise<object>} A promise that resolves to the API response.
     */
    deleteTechnician(id) {
        return this.http.delete(`${techniciansEndpointPath}/${id}`);
    }
}
