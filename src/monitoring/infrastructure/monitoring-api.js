import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const equipmentsEndpointPath = import.meta.env.VITE_EQUIPMENTS_ENDPOINT_PATH;

export class MonitoringApi extends BaseApi {
    #equipmentsEndpointPath;

    constructor() {
        super();
        this.#equipmentsEndpointPath = new BaseEndpoint(this, equipmentsEndpointPath);
    }

    getEquipment() {
        return this.#equipmentsEndpointPath.getAll();
    }
}
