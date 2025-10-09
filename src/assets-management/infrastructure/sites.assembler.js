import {Sites} from "@/assets-management/domain/model/sites.entity.js";

export class SitesAssembler {
    static toEntityFromResource(resources) {
        return new Sites({...resources});
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['sites'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}