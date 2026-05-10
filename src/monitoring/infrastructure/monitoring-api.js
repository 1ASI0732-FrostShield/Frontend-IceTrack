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
     */
    getEquipment() {
        return this.#equipmentsEndpointPath.getAll();
    }

    /**
     * Creates new equipment.
    */
    createEquipment(equipmentData) {
        return this.http.post(equipmentsEndpointPath, equipmentData);
    }

    /**
     * Updates equipment.
     */
    updateEquipment(equipmentData) {
        return this.http.put(`${equipmentsEndpointPath}/${equipmentData.id}`, equipmentData);
    }

    /**
     * Delete equipment.
     */
    deleteEquipment(id) {
        return this.http.delete(`${equipmentsEndpointPath}/${id}`);
    }
}

