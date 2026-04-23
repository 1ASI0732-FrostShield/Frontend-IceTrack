import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { IamApi } from "@/iam/infrastructure/iam.api.js";
import { UserAssembler } from "@/iam/infrastructure/user.assembler.js";
import i18n from '@/i18n.js';

const iamApi = new IamApi();

const roleMap = {
    0: 'owner',
    1: 'provider'
};

const getRoleAsString = (role) => {
    if (typeof role === 'number') {
        return roleMap[role] || 'unknown';
    }
    return role;
};


export const useAuthStore = defineStore("auth", () => {
    const t = (key) => i18n.global.t(key);

    const tokenKey = 'token';
    const user = ref(null);
    const token = ref(localStorage.getItem(tokenKey) || null);
    const errors = ref([]);

    const isLoggedIn = computed(() => !!token.value && !!user.value);
    const currentUserId = computed(() => user.value?.id || null);
    const currentUserRole = computed(() => user.value?.role || null);
    const currentUserTenantId = computed(() => user.value?.tenantId || null); // New computed property for tenantId

    async function login(username, password) {
        errors.value = [];
        try {
            const response = await iamApi.login(username, password);

            const rawUser = response.data; // { id, username, token, role, tenantId, ...}

            if (!rawUser.token || !rawUser.id || !rawUser.username) {
                errors.value.push({ message: t('auth.errors.invalidResponse') });
                return false;
            }

            // Mapeamos la respuesta del backend al modelo de recurso del frontend.
            const userResource = {
                id: rawUser.id,
                email: rawUser.username,
                role: getRoleAsString(rawUser.role), // Ensure role is a string
                name: rawUser.name || rawUser.username,
                token: rawUser.token,
                tenantId: rawUser.tenantId // Store tenantId
            };

            user.value = UserAssembler.toEntityFromResource(userResource);
            token.value = rawUser.token;

            localStorage.setItem(tokenKey, token.value);
            localStorage.setItem('user', JSON.stringify(user.value));

            return true;
        } catch (error) {
            const status = error.response?.status;
            let errorMessage = t('errors.occurred');

            if (status === 400 || status === 401) {
                errorMessage = error.response?.data?.message || t('auth.errors.invalidCredentials');
            } else if (status === 500) {
                console.error("SERVER ERROR 500:", error.response?.data);
                errorMessage = t('errors.occurred');
            }

            errors.value.push({ message: errorMessage });
            return false;
        }
    }

    async function register(userData) {
        errors.value = [];
        try {
            const dataToSend = { ...userData, role: getRoleAsString(userData.role) };
            await iamApi.register(dataToSend);
            return true;
        } catch (error) {
            const status = error.response?.status;
            let errorMessage = t('errors.registrationFailed');

            if (status === 400) {
                errorMessage = error.response?.data?.message || t('errors.registrationFailed');
            } else if (status === 500) {
                console.error("SERVER ERROR 500:", error.response?.data);
                errorMessage = t('errors.occurred');
            }

            errors.value.push({ message: errorMessage });
            return false;
        }
    }

    function logout() {
        user.value = null;
        token.value = null;
        localStorage.removeItem(tokenKey);
        localStorage.removeItem('user');
        errors.value = [];
    }

    function loadUserFromToken() {
        const storedToken = localStorage.getItem(tokenKey);
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            try {
                token.value = storedToken;
                const parsedUser = JSON.parse(storedUser);
                parsedUser.role = getRoleAsString(parsedUser.role); // Ensure role is a string
                user.value = UserAssembler.toEntityFromResource(parsedUser);
            } catch (e) {
                console.error("Error al cargar usuario desde localStorage, limpiando sesión.", e);
                logout();
            }
        }
    }

    loadUserFromToken();

    return {
        user,
        token,
        errors,
        isLoggedIn,
        currentUserId,
        currentUserRole,
        currentUserTenantId,
        login,
        logout,
        register,
        loadUserFromToken,
    };
});