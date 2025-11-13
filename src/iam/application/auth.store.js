import { defineStore } from 'pinia'
import { AuthApi } from '@/iam/infrastructure/auth.api.js'

const authApi = new AuthApi()
const AUTH_KEY = 'learning_center_auth'

// Helper to save the state in localStorage
function saveState(state) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(state));
}

// Helper to load the state from localStorage
function loadState() {
    const state = localStorage.getItem(AUTH_KEY);
    return state ? JSON.parse(state) : null;
}

export const useAuthStore = defineStore('auth', {
    state: () => {
        // Load the initial state from localStorage on startup
        const storedState = loadState();
        return {
            isAuthenticated: storedState?.isAuthenticated ?? false,
            user: storedState?.user ?? null,
            token: storedState?.token ?? null,
            role: storedState?.role ?? null,
            // The role will be stored here, crucial for segmentation.
        }
    },

    getters: {
        // Checks if the user is authenticated
        isLoggedIn: (state) => state.isAuthenticated,
        // Returns the role for frontend authorization logic
        userRole: (state) => state.role,
        // Returns the JWT token
        authToken: (state) => state.token,
    },

    actions: {
        /**
         * Handles the sign-in process.
         * @param {string} username
         * @param {string} password
         */
        async signIn(username, password) {
            try {
                const response = await authApi.signIn(username, password);

                // response.data is the AuthenticatedUserResource(Id, Username, Token, Role)
                const userData = response.data;

                this.isAuthenticated = true;
                this.user = { id: userData.id, username: userData.username };
                this.token = userData.token;
                this.role = userData.role; // Capture the role

                // Set the default Authorization header for all requests
                authApi.http.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;

                saveState({
                    isAuthenticated: this.isAuthenticated,
                    user: this.user,
                    token: this.token,
                    role: this.role
                });

                return true;
            } catch (error) {
                this.signOut(); // Clear state if sign-in fails
                throw error;
            }
        },

        /**
         * Handles the new user registration process.
         * @param {string} username
         * @param {string} password
         */
        async signUp(username, password) {
            try {
                await authApi.signUp(username, password);
                return true; // Registration success
            } catch (error) {
                throw error; // Propagate error to display in the UI
            }
        },

        /**
         * Signs out the user.
         */
        signOut() {
            this.isAuthenticated = false;
            this.user = null;
            this.token = null;
            this.role = null;

            // Remove the Authorization header and the storage
            delete authApi.http.defaults.headers.common['Authorization'];
            localStorage.removeItem(AUTH_KEY);
        },

        /**
         * Initializes Axios configuration on application load,
         * using the stored token if it exists.
         */
        initializeAuth() {
            if (this.token) {
                authApi.http.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
            } else {
                delete authApi.http.defaults.headers.common['Authorization'];
            }
        }
    },
})