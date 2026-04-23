import { Equipments } from "@/monitoring/domain/model/equipments.entity.js";

/**
 * Assembler for converting API resources to Equipment entities.
 * @class
 */
export class EquipmentAssembler {
    /**
     * Converts a plain resource object to a Equipment entity.
     */
    static toEntityFromResource(resources) {
        return new Equipments({...resources});
    }

    /**
     * Converts an API response to an array of Equipment entities.
     * Handles both array and object response formats.
     * Logs an error and returns an empty array if the response status is not 200.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['equipments'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }

}
