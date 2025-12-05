import { Alert } from "@/monitoring/domain/model/alerts.entity.js";

export class AlertAssembler {
    static toEntityFromResource(resources) {
        return new Alert({ ...resources });
    }

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
