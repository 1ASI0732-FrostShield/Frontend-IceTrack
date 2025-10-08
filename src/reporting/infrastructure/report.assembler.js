import {Report} from "../domain/model/report.entity.js";

/**
 * Assembler for converting API resources to Report entities.
 * @class
 */
export class ReportAssembler {

    /**
     * Converts a plain resource object to a Report entity.
     * @param {Object} resource - The resource object representing a report.
     * @returns {Report} The corresponding Report entity.
     */
    static toEntityFromResource(resource) {
        return new Report({...resource})
    }

    /**
     * Converts an API response to an array of Report entities.
     * Handles both array and object response formats.
     * Logs an error and returns an empty array if the response status is not 200.
     *
     * @param {import('axios').AxiosResponse} response - The API response containing report data.
     * @returns {Report[]} Array of Report entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        const resources = Array.isArray(response.data) ? response.data : []

        if (!resources.length) {
            console.warn('No report data found in response:', response.data)
        }

        return resources.map(resource => this.toEntityFromResource(resource))
    }
}