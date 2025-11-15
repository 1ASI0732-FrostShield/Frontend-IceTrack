import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { IamApi } from "@/iam/infrastructure/iam.api.js";
import { UserAssembler } from "@/iam/infrastructure/user.assembler.js";
import i18n from '@/i18n.js';

const iamApi = new IamApi();

export const useAuthStore = defineStore("auth", () => {
    const t = (key) => i18n.global.t(key);

    const tokenKey = 'token';
    const user = ref(null);
    const token = ref(localStorage.getItem(tokenKey) || null);
    const errors = ref([]);

    const isLoggedIn = computed(() => !!token.value && !!user.value);
    const currentUserId = computed(() => user.value?.id || null);
    const currentUserRole = computed(() => user.value?.role || null);

    async function login(username, password) {
        errors.value = [];
        try {
            const response = await iamApi.login(username, password);

            const rawUser = response.data; // { id, username, token, role, ...}

            if (!rawUser.token || !rawUser.id || !rawUser.username) {
                errors.value.push({ message: t('auth.errors.invalidResponse') });
                return false;
            }

            // Mapeamos la respuesta del backend al modelo de recurso del frontend.
            const userResource = {
                id: rawUser.id,
                email: rawUser.username,
                role: rawUser.role,
                name: rawUser.name || rawUser.username,
                token: rawUser.token
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
            await iamApi.register(userData);
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
                user.value = UserAssembler.toEntityFromResource(JSON.parse(storedUser));
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
        login,
        logout,
        register,
        loadUserFromToken,
    };
});