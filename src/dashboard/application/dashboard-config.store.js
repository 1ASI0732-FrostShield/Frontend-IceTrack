import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { DashboardConfigApi } from "@/dashboard/infrastructure/dashboard-config-api.js";
import { DashboardConfigAssembler } from "@/dashboard/infrastructure/dashboard-config.assembler.js";
import { useAuthStore } from "@/iam/application/auth.store.js";

const dashboardConfigApi = new DashboardConfigApi();

/**
 * Dashboard Configuration Store
 * Manages dashboard configuration state and operations
 */
export const useDashboardConfigStore = defineStore('dashboardConfig', () => {
    // State
    const config = ref(null);
    const availableCardTypes = ref([]);
    const loading = ref(false);
    const errors = ref([]);

    // Getters
    const hasConfig = computed(() => config.value !== null);

    const visibleCards = computed(() => {
        if (!config.value) return [];
        return config.value.getVisibleCards();
    });

    const defaultSiteId = computed(() => {
        return config.value?.defaultSiteId || null;
    });

    const defaultTemperatureRange = computed(() => {
        return config.value?.defaultTemperatureRange || '-20 to 5';
    });

    // Actions

    /**
     * Load dashboard config for current user
     */
    async function loadConfigForCurrentUser() {
        const authStore = useAuthStore();
        const userId = authStore.currentUserId;

        if (!userId) {
            errors.value.push('No user ID available');
            return;
        }

        loading.value = true;
        errors.value = [];

        try {
            const response = await dashboardConfigApi.getConfigByUserId(userId);
            config.value = DashboardConfigAssembler.toEntityFromResponse(response);

            if (!config.value) {
                // Dashboard config doesn't exist, create default one
                await createDefaultConfig(userId);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                // Config doesn't exist, create it
                await createDefaultConfig(userId);
            } else {
                console.error('Error loading dashboard config:', error);
                errors.value.push(error.message || 'Error loading dashboard configuration');
            }
        } finally {
            loading.value = false;
        }
    }

    /**
     * Create default dashboard config for user
     */
    async function createDefaultConfig(userId) {
        try {
            const createData = {
                userId: userId,
                defaultSiteId: null,
                defaultTemperatureRangeValue: '-20 to 5'
            };

            const response = await dashboardConfigApi.createConfig(createData);
            config.value = DashboardConfigAssembler.toEntityFromResponse(response);
        } catch (error) {
            console.error('Error creating default config:', error);
            errors.value.push('Error creating dashboard configuration');
        }
    }

    /**
     * Update dashboard configuration
     */
    async function updateConfig(updates) {
        if (!config.value) {
            errors.value.push('No config to update');
            return false;
        }

        loading.value = true;
        errors.value = [];

        try {
            const updateData = {
                defaultSiteId: updates.defaultSiteId ?? config.value.defaultSiteId,
                defaultTemperatureRangeValue: updates.defaultTemperatureRange ?? config.value.defaultTemperatureRange
            };

            const response = await dashboardConfigApi.updateConfig(config.value.id, updateData);
            config.value = DashboardConfigAssembler.toEntityFromResponse(response);
            return true;
        } catch (error) {
            console.error('Error updating config:', error);
            errors.value.push(error.message || 'Error updating configuration');
            return false;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Add card to dashboard
     */
    async function addCard(cardType, order) {
        if (!config.value) {
            errors.value.push('No config available');
            return false;
        }

        // Check if card already exists
        if (config.value.hasCard(cardType)) {
            errors.value.push('Card already exists in dashboard');
            return false;
        }

        loading.value = true;
        errors.value = [];

        try {
            const cardData = DashboardConfigAssembler.toAddCardResource(cardType, order, true);
            const response = await dashboardConfigApi.addCard(config.value.id, cardData);
            config.value = DashboardConfigAssembler.toEntityFromResponse(response);
            return true;
        } catch (error) {
            console.error('Error adding card:', error);
            errors.value.push(error.message || 'Error adding card');
            return false;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Remove card from dashboard
     */
    async function removeCard(cardId) {
        if (!config.value) {
            errors.value.push('No config available');
            return false;
        }

        loading.value = true;
        errors.value = [];

        try {
            await dashboardConfigApi.removeCard(config.value.id, cardId);

            // Reload the configuration
            const response = await dashboardConfigApi.getConfigById(config.value.id);
            config.value = DashboardConfigAssembler.toEntityFromResponse(response);

            return true;
        } catch (error) {
            console.error('Error removing card:', error);
            errors.value.push(error.message || 'Error removing card');
            return false;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Update card visibility
     */
    async function updateCardVisibility(cardId, isVisible) {
        if (!config.value) {
            errors.value.push('No config available');
            return false;
        }

        loading.value = true;
        errors.value = [];

        try {
            const response = await dashboardConfigApi.updateCardVisibility(config.value.id, cardId, isVisible);
            config.value = DashboardConfigAssembler.toEntityFromResponse(response);
            return true;
        } catch (error) {
            console.error('Error updating card visibility:', error);
            errors.value.push(error.message || 'Error updating card visibility');
            return false;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Load available card types
     */
    async function loadAvailableCardTypes() {
        try {
            const response = await dashboardConfigApi.getAvailableCardTypes();
            availableCardTypes.value = DashboardConfigAssembler.toCardTypesFromResponse(response);
        } catch (error) {
            console.error('Error loading card types:', error);
            errors.value.push('Error loading available card types');
        }
    }

    /**
     * Clear errors
     */
    function clearErrors() {
        errors.value = [];
    }

    /**
     * Reset store
     */
    function $reset() {
        config.value = null;
        availableCardTypes.value = [];
        loading.value = false;
        errors.value = [];
    }

    return {
        // State
        config,
        availableCardTypes,
        loading,
        errors,

        // Getters
        hasConfig,
        visibleCards,
        defaultSiteId,
        defaultTemperatureRange,

        // Actions
        loadConfigForCurrentUser,
        createDefaultConfig,
        updateConfig,
        addCard,
        removeCard,
        updateCardVisibility,
        loadAvailableCardTypes,
        clearErrors,
        $reset
    };
});