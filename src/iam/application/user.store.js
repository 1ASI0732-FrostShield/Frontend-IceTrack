import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { IamApi } from "@/iam/infrastructure/iam.api.js";
import { UserAssembler} from "@/iam/infrastructure/user.assembler.js";
import { useAuthStore } from "./auth.store.js";

const iamApi = new IamApi();

/**
 * Store de Pinia para gestionar la colección de usuarios de un tenant (vista de administración).
 */
export const useUserStore = defineStore("userManagement", () => {
    const users = ref([]);
    const usersLoaded = ref(false);
    const errors = ref([]);

    const authStore = useAuthStore();

    /**
     * Carga todos los usuarios para el tenant actual.
     */
    async function fetchUsers() {
        if (!authStore.currentTenantId) {
            console.warn("[UserStore] No hay tenantId para cargar usuarios.");
            return;
        }

        usersLoaded.value = false;
        errors.value = [];
        try {
            const response = await iamApi.getUsers(authStore.currentTenantId);
            users.value = UserAssembler.toEntitiesFromResponse(response);
            usersLoaded.value = true;
        } catch (error) {
            errors.value.push({ message: error.message || 'Error al cargar la lista de usuarios.' });
        }
    }

    /**
     * Actualiza la información de un usuario.
     * @param {import('../domain/model/user.entity.js').User} userEntity
     */
    async function updateUser(userEntity) {
        errors.value = [];
        try {
            const response = await iamApi.updateUser(userEntity.id, userEntity);
            const updatedUser = UserAssembler.toEntityFromResource(response.data);

            // Actualizar la lista local
            const index = users.value.findIndex(u => u.id === updatedUser.id);
            if (index !== -1) {
                users.value[index] = updatedUser;
            }

            // Si el usuario actualizado es el usuario autenticado, actualizar el auth store
            if (updatedUser.id === authStore.user.id) {
                authStore.user = updatedUser;
            }

            return true;
        } catch (error) {
            errors.value.push({ message: error.message || 'Error al actualizar usuario.' });
            return false;
        }
    }

    watch(() => authStore.currentTenantId, (newId) => {
        if (newId) {
            fetchUsers();
        } else {
            users.value = [];
            usersLoaded.value = false;
        }
    }, { immediate: true });

    return {
        users,
        usersLoaded,
        errors,
        fetchUsers,
        updateUser,
    };
});