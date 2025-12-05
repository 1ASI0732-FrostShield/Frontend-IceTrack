import {Sites} from "@/assets-management/domain/model/sites.entity.js";

/**
 * Assembler for converting API resources to Site entities.
 * @class
 */
export class SitesAssembler {
    /**
     * Converts a plain resource object to a Site entity.
     * @param {Object} resource - The resource object representing a site.
     * @returns {Site} The corresponding Site entity.
     */
    static toEntityFromResource(resources) {
        return new Sites({...resources});
    }

    /**
     * Converts an API response to an array of Site entities.
     * Handles both array and object response formats.
     * Logs an error and returns an empty array if the response status is not 200.
     *
     * @param {import('axios').AxiosResponse} response - The API response containing site data.
     * @returns {Site[]} Array of Site entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['sites'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }

}
