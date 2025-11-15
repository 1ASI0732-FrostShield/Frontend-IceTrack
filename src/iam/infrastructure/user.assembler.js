import { User} from "@/iam/domain/model/user.entity.js";

/**
 * Assembler for converting API resources to User entities.
 */
export class UserAssembler {
    /**
     * Convierte un recurso (objeto plano de la API) a una entidad User.
     * @param {Object} resource - Objeto plano con propiedades del usuario.
     * @returns {User | null}
     */
    static toEntityFromResource(resource) {
        if (!resource) return null;
             return new User({
            ...resource
        });
    }

    /**
     * Convierte la respuesta de la API (Axios response) a una lista de entidades User.
     * @param {import('axios').AxiosResponse} response
     * @returns {User[]} Lista de entidades User.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`[UserAssembler] Status ${response.status}: Error al obtener datos.`);
            return [];
        }
        const resources = Array.isArray(response.data) ? response.data : [];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}