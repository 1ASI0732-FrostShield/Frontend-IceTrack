import { BaseApi } from "@/shared/infrastructure/base-api.js";

const authEndpointPath = import.meta.env.VITE_AUTH_ENDPOINT_PATH || '/authentication';
const usersEndpointPath = import.meta.env.VITE_USERS_ENDPOINT_PATH || '/users';

/**
 * IAMApi class to handle API operations for Identity and Access Management.
 */
export class IamApi extends BaseApi {

    constructor() {
        super();
    }

    // --- AUTH OPERATIONS ---

    /**
     * Realiza la autenticación llamando al endpoint POST /authentication/sign-in.
     * @param {string} username - El nombre de usuario para autenticar.
     * @param {string} password - La contraseña.
     * @returns {Promise<Object>}
     */
    async login(username, password) {
        // ✅ USAR EL ENDPOINT REAL DEL BACKEND
        const response = await this.http.post(`${authEndpointPath}/sign-in`, {
            username,
            password
        });

        // El backend devuelve: { id, username, token, role }
        return response;
    }

    /**
     * Realiza el registro llamando al endpoint POST /authentication/sign-up.
     * @param {string} username - El nombre de usuario.
     * @param {string} password - La contraseña.
     * @param {number} role - El rol del usuario (0 = Owner, etc.).
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    async register(username, password, role = 0) {
        return await this.http.post(`${authEndpointPath}/sign-up`, {
            username,
            password,
            role
        });
    }

    // --- USER OPERATIONS ---

    /**
     * Obtiene todos los usuarios (requiere autenticación)
     */
    getUsers(tenantId) {
        return this.http.get(usersEndpointPath, { params: { tenantId } });
    }

    /**
     * Obtiene un usuario por ID (requiere autenticación)
     */
    getUserById(id) {
        return this.http.get(`${usersEndpointPath}/${id}`);
    }

    /**
     * Actualiza un usuario (requiere autenticación)
     */
    updateUser(id, resource) {
        return this.http.put(`${usersEndpointPath}/${id}`, resource);
    }
}