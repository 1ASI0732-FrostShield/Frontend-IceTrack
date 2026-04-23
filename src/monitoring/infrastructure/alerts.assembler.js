import { Alert } from "@/monitoring/domain/model/alerts.entity.js";

/**
 * Assembler for converting API resources to Alert entities.
 * @class
 */
export class AlertAssembler {
    /**
     * Converts a plain resource object to a Alert entity.
     */
    static toEntityFromResource(resources) {
        return new Alert({ ...resources });
    }

    /**
     * Converts an API response to an array of Alert entities.
     * Handles both array and object response formats.
     * Logs an error and returns an empty array if the response status is not 200.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }

        let resources = response.data instanceof Array
            ? response.data
            : response.data['alerts'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}

