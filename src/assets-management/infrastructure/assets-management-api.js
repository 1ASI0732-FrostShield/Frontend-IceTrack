import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const sitesEndpointPath = import.meta.env.VITE_SITES_ENDPOINT_PATH;

/**
 * AssetsManagementApi class to handle API operations for Assets Management context.
 * Extends BaseApi and provides CRUD operations for site.
 * @class
 */
export class AssetsManagementApi extends BaseApi {
    #sitesEndpointPath;

    /**
     * Initializes endpoints for sites.
     */
    constructor() {
        super();
        this.#sitesEndpointPath = new BaseEndpoint(this, sitesEndpointPath);
    }

    /**
     * Fetches all sites.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the sites' response.
     */
    getSites() {
        return this.#sitesEndpointPath.getAll();
    }

    /**
     * Creates a new site.
     * @param {object} siteData - The data for the new site.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the new site's response.
     */
    createSite(siteData) {
        return this.http.post(sitesEndpointPath, siteData);
    }
}
