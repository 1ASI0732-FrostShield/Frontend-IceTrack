import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const equipmentsEndpointPath = import.meta.env.VITE_EQUIPMENTS_ENDPOINT_PATH;
const alertsEndpointPath = import.meta.env.VITE_ALERTS_ENDPOINT_PATH;

export class MonitoringApi extends BaseApi {
    #equipmentsEndpointPath;
    #alertsEndpointPath;
    constructor() {
        super();
        this.#equipmentsEndpointPath = new BaseEndpoint(this, equipmentsEndpointPath);
        this.#alertsEndpointPath = new BaseEndpoint(this, alertsEndpointPath);
    }

    getEquipment() {
        return this.#equipmentsEndpointPath.getAll();
    }

    getAlerts() {
        return this.#alertsEndpointPath.getAll();
    }
}
