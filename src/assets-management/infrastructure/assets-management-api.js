import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const sitesEndpointPath = import.meta.env.VITE_SITES_ENDPOINT_PATH;

export class AssetsManagementApi extends BaseApi {
    #sitesEndpointPath;

    constructor() {
        super();
        this.#sitesEndpointPath = new BaseEndpoint(this, sitesEndpointPath);
    }

    getSites() {
        return this.#sitesEndpointPath.getAll();
    }
}
