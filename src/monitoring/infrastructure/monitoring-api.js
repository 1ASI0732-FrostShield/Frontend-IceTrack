import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const equipmentsEndpointPath = import.meta.env.VITE_EQUIPMENTS_ENDPOINT_PATH;

/**
 * MonitoringApi class to handle API operations for equipment context.
 */
export class MonitoringApi extends BaseApi {
    #equipmentsEndpointPath;

    /**
     * Initializes endpoints for equipment.
     */
    constructor() {
        super();
        this.#equipmentsEndpointPath = new BaseEndpoint(this, equipmentsEndpointPath);
    }

    /**
     * Fetches all equipments.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the equipments' response.
     */
    getEquipment() {
        return this.#equipmentsEndpointPath.getAll();
    }

    /**
     * Creates a new equipment.
     * @param {object} equipmentData - The data for the new site.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the new site's response.
     */
    createEquipment(equipmentData) {
        return this.http.post(equipmentsEndpointPath, equipmentData);
    }
}

