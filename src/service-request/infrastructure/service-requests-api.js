import { BaseApi} from "@/shared/infrastructure/base-api.js";
import { BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const serviceRequestsEndpointPath = import.meta.env.VITE_SERVICE_REQUESTS_ENDPOINT_PATH || '/serviceRequests';

export class ServiceRequestsApi extends BaseApi {
    #requestsEndpoint;

    constructor() {
        super();
        this.#requestsEndpoint = new BaseEndpoint(this, serviceRequestsEndpointPath);
    }

    getAllRequests() {
        return this.#requestsEndpoint.getAll();
    }

    createRequest(resource) {
        return this.#requestsEndpoint.create(resource);
    }

    cancelRequest(id) {
        return this.#requestsEndpoint.update(id, { status: 'canceled', canceledAt: new Date().toISOString() });
    }
}