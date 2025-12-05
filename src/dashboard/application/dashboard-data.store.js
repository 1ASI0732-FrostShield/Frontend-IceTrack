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
 * @returns {Object} The store object with state and actions.
 */
export const useDashboardDataStore = defineStore('dashboardData', () => {
    // STATE
    const kpis = ref(null);
    const alerts = ref([]);
    const temperatureChartData = ref(null);
    const loading = ref(false);
    const loadingAlerts = ref(false);
    const errors = ref([]);

    // COMPUTED
    const hasData = computed(() => {
        return kpis.value && kpis.value.hasData();
    });

    const statistics = computed(() => {
        if (!kpis.value) {
            return {
                minTemperature: 0,
                maxTemperature: 0,
                totalDataPoints: 0
            };
        }

        return {
            minTemperature: kpis.value.minTemperature,
            maxTemperature: kpis.value.maxTemperature,
            totalDataPoints: temperatureChartData.value?.datasets?.[0]?.data?.length || 0
        };
    });

    const hasValidChartData = computed(() => {
        return temperatureChartData.value &&
            temperatureChartData.value.datasets?.[0]?.data?.length > 0;
    });

    // ACTIONS

    /**
     * Load all dashboard data (KPIs, alerts, chart data).
     * @param {number|null} siteId - Optional site ID filter.
     * @returns {Promise} A promise that resolves when all data is loaded.
     */
    function loadAll(siteId = null) {
        loading.value = true;
        errors.value = [];

        return Promise.all([
            loadKpis(siteId),
            loadAlerts(siteId),
            loadChartData(siteId)
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
     * @param {number|null} siteId - Optional site ID filter.
     * @returns {Promise} A promise that resolves when KPIs are loaded.
     */
    function loadKpis(siteId = null) {
        return Promise.all([
            dashboardDataApi.getEquipments(),
            dashboardDataApi.getOpenAlerts()
        ])
            .then(([equipmentsResponse, alertsResponse]) => {
                const serviceRequestsCount = 0; // TODO: Add service requests when API is ready

                kpis.value = DashboardDataAssembler.toKpisFromResponses(
                    equipmentsResponse,
                    alertsResponse,
                    serviceRequestsCount
                );
            })
            .catch(error => {
                console.error('Error loading KPIs:', error);

                // Set empty KPIs on error
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

        return dashboardDataApi.getRecentAlerts(siteId)
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
     * Load temperature chart data.
     * @param {number|null} siteId - Optional site ID filter.
     * @returns {Promise} A promise that resolves when chart data is loaded.
     */
    function loadChartData(siteId = null) {
        return dashboardDataApi.getTemperatureTrends(siteId)
            .then(trendsResponse => {
                if (trendsResponse) {
                    temperatureChartData.value = DashboardDataAssembler.toChartDataFromTrends(trendsResponse);
                } else {
                    temperatureChartData.value = null;
                }
            })
            .catch(error => {
                console.error('Error loading chart data:', error);
                temperatureChartData.value = null;
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
        temperatureChartData.value = null;
        loading.value = false;
        loadingAlerts.value = false;
        errors.value = [];
    }

    return {
        // State
        kpis,
        alerts,
        temperatureChartData,
        loading,
        loadingAlerts,
        errors,
        // Computed
        hasData,
        statistics,
        hasValidChartData,
        // Actions
        loadAll,
        loadKpis,
        loadAlerts,
        loadChartData,
        refresh,
        clearErrors,
        $reset
    };
});