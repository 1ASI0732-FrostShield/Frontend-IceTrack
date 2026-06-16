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

    createSite(siteData) {
        return this.http.post(sitesEndpointPath, siteData);
    }

    updateSite(resource) {
        return this.http.put(`${sitesEndpointPath}/${resource.id}`, resource);
    }

    deleteSite(id) {
        return this.#sitesEndpointPath.delete(id);
    }

    getSiteById(id) {
        return this.http.get(`${sitesEndpointPath}/${id}`);
    }
}
