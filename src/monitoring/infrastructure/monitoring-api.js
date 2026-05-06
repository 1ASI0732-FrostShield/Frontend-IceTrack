import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const equipmentsEndpointPath = import.meta.env.VITE_EQUIPMENTS_ENDPOINT_PATH;
const alertsEndpointPath = import.meta.env.VITE_ALERTS_ENDPOINT_PATH;

/**
 * MonitoringApi class to handle API operations for alert and equipment context.
 */
export class MonitoringApi extends BaseApi {
    #equipmentsEndpointPath;
    #alertsEndpointPath;

    /**
     * Initializes endpoints for alert and equipment.
     */
    constructor() {
        super();
        this.#equipmentsEndpointPath = new BaseEndpoint(this, equipmentsEndpointPath);
        this.#alertsEndpointPath = new BaseEndpoint(this, alertsEndpointPath);
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

    /**
     * Fetches all alerts.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the alerts' response.
     */
    getAlerts() {
        return this.#alertsEndpointPath.getAll();
    }

    /**
     * Deletes a alerts by its ID.
     */
    deleteAlert(alertId) {
        return this.#alertsEndpointPath.delete(alertId);
    }

    acknowledgeAlert(alertId) {
        return this.#alertsEndpointPath.patch(`${alertId}/acknowledge`);
    }
}

