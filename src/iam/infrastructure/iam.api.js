import { BaseApi } from "@/shared/infrastructure/base-api.js";

const authEndpointPath = import.meta.env.VITE_AUTH_ENDPOINT_PATH || '/authentication';
const usersEndpointPath = import.meta.env.VITE_USERS_ENDPOINT_PATH || '/users';

export class IamApi extends BaseApi {

    constructor() {
        super();
    }

    // --- AUTH OPERATIONS ---

    async login(username, password) {
        const response = await this.http.get(usersEndpointPath, { params: { username } });
        const users = response.data;

        if (users.length === 0) throw new Error('Invalid username or password');
        const user = users[0];
        if (user.password !== password) throw new Error('Invalid username or password');

        const token = btoa(`${username}:${password}`);
        return {
            data: { id: user.id, username: user.username, role: user.role, token: token, name: user.name, tenantId: user.tenantId }
        };
    }

    register(userData) {
        return this.http.post(`${authEndpointPath}/sign-up`, userData);
    }

    // --- USER OPERATIONS ---

    getUsersByRole(role) {
        return this.http.get(usersEndpointPath, { params: { role } });
    }

    updateUser(id, resource) {
        return this.http.put(`${usersEndpointPath}/${id}`, resource);
    }
}