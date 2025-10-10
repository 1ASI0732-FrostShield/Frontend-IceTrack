import { Equipment } from "@/monitoring/domain/model/equipments.entity.js";

export class EquipmentAssembler {
    static toEntityFromResource(resources) {
        return new Equipment({...resources});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['equipments'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}