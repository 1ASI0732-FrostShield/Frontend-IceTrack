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
        const response = await this.http.get(usersEndpointPath, { params: { username } });
        const users = response.data;

        if (users.length === 0) {
            throw new Error('Invalid username or password');
        }

        const user = users[0];
        if (user.password !== password) {
            throw new Error('Invalid username or password');
        }

        // Simulate the token response from the C# backend
        const token = btoa(`${username}:${password}`);
        return {
            data: {
                id: user.id,
                username: user.username,
                role: user.role,
                token: token
            }
        };
    }

    /**
     * Realiza el registro llamando al endpoint POST /authentication/sign-up.
     * @param {Object} userData - Debe contener propiedades en camelCase (username, password, role, name).
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    register(userData) {
        return this.http.post(`${authEndpointPath}/sign-up`, userData);
    }

    // --- USER OPERATIONS ---

    getUsers(tenantId) {
        return this.http.get(usersEndpointPath, { params: { tenantId } });
    }

    updateUser(id, resource) {
        return this.http.put(`${usersEndpointPath}/${id}`, resource);
    }
}