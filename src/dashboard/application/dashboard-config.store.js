import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { DashboardConfigApi } from "@/dashboard/infrastructure/dashboard-config-api.js";
import { DashboardConfigAssembler } from "@/dashboard/infrastructure/dashboard-config.assembler.js";
import { useAuthStore } from "@/iam/application/auth.store.js";

const dashboardConfigApi = new DashboardConfigApi();

/**
 * Pinia store for managing Dashboard Configuration bounded context state.
 * Handles dashboard configuration data fetching, creation, update, and deletion.
 * @returns {Object} The store object with state and actions.
 */
export const useDashboardConfigStore = defineStore('dashboardConfig', () => {
    // STATE
    const config = ref(null);
    const availableCardTypes = ref([]);
    const loading = ref(false);
    const errors = ref([]);

    // COMPUTED
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

    // ACTIONS

    /**
     * Load dashboard config for current user.
     * @returns {Promise} A promise that resolves when config is loaded.
     */
    function loadConfigForCurrentUser() {
        const authStore = useAuthStore();
        const userId = authStore.currentUserId;

        if (!userId) {
            errors.value.push('No user ID available');
            return Promise.reject('No user ID available');
        }

        loading.value = true;
        errors.value = [];

        return dashboardConfigApi.getConfigByUserId(userId)
            .then(response => {
                config.value = DashboardConfigAssembler.toEntityFromResponse(response);

                if (!config.value) {
                    return createDefaultConfig(userId);
                }
            })
            .catch(error => {
                if (error.response?.status === 404) {
                    return createDefaultConfig(userId);
                } else {
                    console.error('Error loading dashboard config:', error);
                    errors.value.push(error.message || 'Error loading dashboard configuration');
                }
            })
            .finally(() => {
                loading.value = false;
            });
    }

    /**
     * Create default dashboard config for user.
     * @param {number} userId - The user ID.
     * @returns {Promise} A promise that resolves when config is created.
     */
    function createDefaultConfig(userId) {
        const createData = {
            userId: userId,
            defaultSiteId: null,
            defaultTemperatureRangeValue: '-20 to 5'
        };

        return dashboardConfigApi.createConfig(createData)
            .then(response => {
                config.value = DashboardConfigAssembler.toEntityFromResponse(response);
            })
            .catch(error => {
                console.error('Error creating default config:', error);
                errors.value.push('Error creating dashboard configuration');
            });
    }

    /**
     * Update dashboard configuration.
     * @param {Object} updates - The updates to apply.
     * @returns {Promise<boolean>} A promise that resolves to true if successful.
     */
    function updateConfig(updates) {
        if (!config.value) {
            errors.value.push('No config to update');
            return Promise.resolve(false);
        }

        loading.value = true;
        errors.value = [];

        const updateData = {
            defaultSiteId: updates.defaultSiteId ?? config.value.defaultSiteId,
            defaultTemperatureRangeValue: updates.defaultTemperatureRange ?? config.value.defaultTemperatureRange
        };

        return dashboardConfigApi.updateConfig(config.value.id, updateData)
            .then(response => {
                config.value = DashboardConfigAssembler.toEntityFromResponse(response);
                return true;
            })
            .catch(error => {
                console.error('Error updating config:', error);
                errors.value.push(error.message || 'Error updating configuration');
                return false;
            })
            .finally(() => {
                loading.value = false;
            });
    }

    /**
     * Add card to dashboard.
     * @param {string} cardType - The card type to add.
     * @param {number} order - The card order.
     * @returns {Promise<boolean>} A promise that resolves to true if successful.
     */
    function addCard(cardType, order) {
        if (!config.value) {
            errors.value.push('No config available');
            return Promise.resolve(false);
        }

        if (config.value.hasCard(cardType)) {
            errors.value.push('Card already exists in dashboard');
            return Promise.resolve(false);
        }

        loading.value = true;
        errors.value = [];

        const cardData = DashboardConfigAssembler.toAddCardResource(cardType, order, true);

        return dashboardConfigApi.addCard(config.value.id, cardData)
            .then(response => {
                config.value = DashboardConfigAssembler.toEntityFromResponse(response);
                return true;
            })
            .catch(error => {
                console.error('Error adding card:', error);
                errors.value.push(error.message || 'Error adding card');
                return false;
            })
            .finally(() => {
                loading.value = false;
            });
    }

    /**
     * Remove card from dashboard.
     * @param {number} cardId - The card ID to remove.
     * @returns {Promise<boolean>} A promise that resolves to true if successful.
     */
    function removeCard(cardId) {
        if (!config.value) {
            errors.value.push('No config available');
            return Promise.resolve(false);
        }

        loading.value = true;
        errors.value = [];

        return dashboardConfigApi.removeCard(config.value.id, cardId)
            .then(() => {
                return dashboardConfigApi.getConfigById(config.value.id);
            })
            .then(response => {
                config.value = DashboardConfigAssembler.toEntityFromResponse(response);
                return true;
            })
            .catch(error => {
                console.error('Error removing card:', error);
                errors.value.push(error.message || 'Error removing card');
                return false;
            })
            .finally(() => {
                loading.value = false;
            });
    }

    /**
     * Update card visibility.
     * @param {number} cardId - The card ID.
     * @param {boolean} isVisible - The visibility state.
     * @returns {Promise<boolean>} A promise that resolves to true if successful.
     */
    function updateCardVisibility(cardId, isVisible) {
        if (!config.value) {
            errors.value.push('No config available');
            return Promise.resolve(false);
        }

        loading.value = true;
        errors.value = [];

        return dashboardConfigApi.updateCardVisibility(config.value.id, cardId, isVisible)
            .then(response => {
                config.value = DashboardConfigAssembler.toEntityFromResponse(response);
                return true;
            })
            .catch(error => {
                console.error('Error updating card visibility:', error);
                errors.value.push(error.message || 'Error updating card visibility');
                return false;
            })
            .finally(() => {
                loading.value = false;
            });
    }

    /**
     * Load available card types.
     * @returns {Promise} A promise that resolves when card types are loaded.
     */
    function loadAvailableCardTypes() {
        return dashboardConfigApi.getAvailableCardTypes()
            .then(response => {
                availableCardTypes.value = DashboardConfigAssembler.toCardTypesFromResponse(response);
            })
            .catch(error => {
                console.error('Error loading card types:', error);
                errors.value.push('Error loading available card types');
            });
    }

    /**
     * Clear errors.
     */
    function clearErrors() {
        errors.value = [];
    }

    /**
     * Reset store to initial state.
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
        // Computed
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