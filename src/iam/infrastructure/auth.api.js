import { BaseApi} from "@/shared/infrastructure/base-api.js";
import { BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

/**
 * Service to handle authentication operations with the backend.
 * Extends BaseEndpoint but customizes 'signIn' and 'signUp' as they are non-CRUD operations.
 */
export class AuthApi extends BaseEndpoint {
    constructor() {
        const baseApi = new BaseApi();
        // The path to the Authentication controller
        super(baseApi, '/authentication');
    }

    /**
     * Sends a sign-in request to the backend.
     * @param {string} username - The username of the user.
     * @param {string} password - The password of the user.
     * @returns {Promise<object>} The authenticated user resource (Id, Username, Token, Role).
     */
    signIn(username, password) {
        return this.http.post(`${this.endpointPath}/sign-in`, { username, password });
    }

    /**
     * Sends a sign-up request to the backend.
     * @param {string} username - The username of the new user.
     * @param {string} password - The password of the new user.
     * @returns {Promise<object>} The response message from the backend.
     */
    signUp(username, password) {
        return this.http.post(`${this.endpointPath}/sign-up`, { username, password });
    }
}