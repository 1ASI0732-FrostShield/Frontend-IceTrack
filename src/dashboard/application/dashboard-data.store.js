import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { DashboardKpis } from "@/dashboard/domain/entities/dashboard-kpis.entity.js";
import { DashboardDataApi } from "@/dashboard/infrastructure/dashboard-data-api.js";
import { DashboardDataAssembler } from "@/dashboard/infrastructure/dashboard-data.assembler.js";

const dashboardDataApi = new DashboardDataApi();

/**
 * Dashboard Data Store
 * Manages KPIs, alerts, and other dashboard data
 * This is separate from configuration to follow separation of concerns
 */
export const useDashboardDataStore = defineStore('dashboardData', () => {
    // State
    const kpis = ref(null);
    const alerts = ref([]);
    const temperatureChartData = ref(null);
    const loading = ref(false);
    const loadingAlerts = ref(false);
    const errors = ref([]);

    // Getters
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

    // Actions

    /**
     * Load all dashboard data (KPIs, alerts, chart data)
     */
    async function loadAll(siteId = null) {
        loading.value = true;
        errors.value = [];

        try {
            await Promise.all([
                loadKpis(siteId),
                loadAlerts(siteId),
                loadChartData(siteId)
            ]);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            errors.value.push('Error loading dashboard data');
        } finally {
            loading.value = false;
        }
    }

    /**
     * Load KPIs data from real APIs
     */
    async function loadKpis(siteId = null) {
        try {
            const [equipmentsResponse, alertsResponse] = await Promise.all([
                dashboardDataApi.getEquipments(),
                dashboardDataApi.getOpenAlerts()
            ]);

            // TODO: Add service requests when API is ready
            const serviceRequestsCount = 0;

            // Transform to domain entity
            kpis.value = DashboardDataAssembler.toKpisFromResponses(
                equipmentsResponse,
                alertsResponse,
                serviceRequestsCount
            );
        } catch (error) {
            console.error('Error loading KPIs:', error);

            // No fallback to mocks - just set empty KPIs
            kpis.value = new DashboardKpis({
                totalEquipments: 0,
                openAlerts: 0,
                activeRequests: 0,
                avgTemperature: 0,
                minTemperature: 0,
                maxTemperature: 0
            });
        }
    }

    /**
     * Load recent alerts from real API
     */
    async function loadAlerts(siteId = null) {
        loadingAlerts.value = true;

        try {
            const response = await dashboardDataApi.getRecentAlerts(siteId);
            alerts.value = DashboardDataAssembler.toAlertsFromResponse(response);
        } catch (error) {
            console.error('Error loading alerts:', error);

            // No fallback - just empty array
            alerts.value = [];
        } finally {
            loadingAlerts.value = false;
        }
    }

    /**
     * Load temperature chart data
     */
    async function loadChartData(siteId = null) {
        try {
            const trendsResponse = await dashboardDataApi.getTemperatureTrends(siteId);

            if (trendsResponse) {
                temperatureChartData.value = DashboardDataAssembler.toChartDataFromTrends(trendsResponse);
            } else {
                // Endpoint no disponible - dejar en null
                temperatureChartData.value = null;
            }
        } catch (error) {
            console.error('Error loading chart data:', error);

            // No fallback - just null
            temperatureChartData.value = null;
        }
    }

    /**
     * Refresh all data
     */
    async function refresh(siteId = null) {
        await loadAll(siteId);
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

        // Getters
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