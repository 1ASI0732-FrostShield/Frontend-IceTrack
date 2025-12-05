import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { DashboardKpis } from "@/dashboard/domain/entities/dashboard-kpis.entity.js";
import { DashboardDataApi } from "@/dashboard/infrastructure/dashboard-data-api.js";
import { DashboardDataAssembler } from "@/dashboard/infrastructure/dashboard-data.assembler.js";

const dashboardDataApi = new DashboardDataApi();

/**
 * Pinia store for managing Dashboard Data bounded context state.
 * Handles KPIs, alerts, and other dashboard data fetching and management.
 * This is separate from configuration to follow separation of concerns.
 * ONLY loads data for cards with available endpoints
 * @returns {Object} The store object with state and actions.
 */
export const useDashboardDataStore = defineStore('dashboardData', () => {
    // STATE
    const kpis = ref(null);
    const alerts = ref([]);
    const loading = ref(false);
    const loadingAlerts = ref(false);
    const errors = ref([]);

    // COMPUTED
    const hasData = computed(() => {
        return kpis.value && kpis.value.hasData();
    });

    // ACTIONS

    /**
     * Load all dashboard data (KPIs and alerts).
     * REMOVED: temperature chart data (no endpoint available)
     * @param {number|null} siteId - Optional site ID filter.
     * @returns {Promise} A promise that resolves when all data is loaded.
     */
    function loadAll(siteId = null) {
        loading.value = true;
        errors.value = [];

        return Promise.all([
            loadKpis(siteId),
            loadAlerts(siteId)
        ])
            .then(() => {
                console.log('All dashboard data loaded successfully');
            })
            .catch(error => {
                console.error('Error loading dashboard data:', error);
                errors.value.push('Error loading dashboard data');
            })
            .finally(() => {
                loading.value = false;
            });
    }

    /**
     * Load KPIs data from real APIs.
     * ONLY loads MonitoredEquipment and OpenAlerts (available endpoints)
     * @param {number|null} siteId - Optional site ID filter.
     * @returns {Promise} A promise that resolves when KPIs are loaded.
     */
    function loadKpis(siteId = null) {
        return Promise.all([
            dashboardDataApi.getEquipments(null, siteId),
            dashboardDataApi.getOpenAlerts(null, null, siteId)
        ])
            .then(([equipmentsResponse, alertsResponse]) => {
                kpis.value = DashboardDataAssembler.toKpisFromResponses(
                    equipmentsResponse,
                    alertsResponse,
                    0 // serviceRequestsCount - not available
                );
            })
            .catch(error => {
                console.error('Error loading KPIs:', error);

                // Set empty KPIs on error - dashboard doesn't break
                kpis.value = new DashboardKpis({
                    totalEquipments: 0,
                    openAlerts: 0,
                    activeRequests: 0,
                    avgTemperature: 0,
                    minTemperature: 0,
                    maxTemperature: 0
                });
            });
    }

    /**
     * Load recent alerts from real API.
     * @param {number|null} siteId - Optional site ID filter.
     * @returns {Promise} A promise that resolves when alerts are loaded.
     */
    function loadAlerts(siteId = null) {
        loadingAlerts.value = true;

        return dashboardDataApi.getRecentAlerts(null, siteId)
            .then(response => {
                alerts.value = DashboardDataAssembler.toAlertsFromResponse(response);
            })
            .catch(error => {
                console.error('Error loading alerts:', error);
                alerts.value = [];
            })
            .finally(() => {
                loadingAlerts.value = false;
            });
    }

    /**
     * Refresh all dashboard data.
     * @param {number|null} siteId - Optional site ID filter.
     * @returns {Promise} A promise that resolves when data is refreshed.
     */
    function refresh(siteId = null) {
        return loadAll(siteId);
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
        kpis.value = null;
        alerts.value = [];
        loading.value = false;
        loadingAlerts.value = false;
        errors.value = [];
    }

    return {
        // State
        kpis,
        alerts,
        loading,
        loadingAlerts,
        errors,
        // Computed
        hasData,
        // Actions
        loadAll,
        loadKpis,
        loadAlerts,
        refresh,
        clearErrors,
        $reset
    };
});