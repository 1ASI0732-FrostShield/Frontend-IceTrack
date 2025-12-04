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
            // Call real APIs
            const [equipmentsResponse, alertsResponse] = await Promise.all([
                dashboardDataApi.getEquipments(siteId),
                dashboardDataApi.getOpenAlerts(siteId)
            ]);

            // TODO: Add service requests when API is ready
            const serviceRequestsCount = 0; // Placeholder

            // Transform to domain entity
            kpis.value = DashboardDataAssembler.toKpisFromResponses(
                equipmentsResponse,
                alertsResponse,
                serviceRequestsCount
            );
        } catch (error) {
            console.error('Error loading KPIs:', error);
            errors.value.push('Error loading KPIs');

            // Fallback to mock data if API fails
            useMockKpis();
        }
    }

    /**
     * Load recent alerts from real API
     */
    async function loadAlerts(siteId = null) {
        loadingAlerts.value = true;

        try {
            const response = await dashboardDataApi.getRecentAlerts(siteId, 5);
            alerts.value = DashboardDataAssembler.toAlertsFromResponse(response);
        } catch (error) {
            console.error('Error loading alerts:', error);
            errors.value.push('Error loading alerts');

            // Fallback to mock data
            useMockAlerts();
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
            temperatureChartData.value = DashboardDataAssembler.toChartDataFromTrends(trendsResponse);
        } catch (error) {
            console.error('Error loading chart data:', error);
            errors.value.push('Error loading chart data');

            // Fallback to mock data
            useMockChartData();
        }
    }

    /**
     * Fallback mock KPIs
     */
    function useMockKpis() {
        // ✅ FIXED: Usar import directo en lugar de require
        kpis.value = new DashboardKpis({
            totalEquipments: 12,
            openAlerts: 3,
            activeRequests: 5,
            avgTemperature: -15.5,
            minTemperature: -20.0,
            maxTemperature: -10.0
        });
    }

    /**
     * Fallback mock alerts
     */
    function useMockAlerts() {
        alerts.value = [
            {
                id: 1,
                equipmentName: 'Freezer A1',
                siteName: 'Almacén Central',
                severity: 'critical',
                status: 'open',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                equipmentName: 'Cooler B3',
                siteName: 'Sucursal Norte',
                severity: 'warning',
                status: 'acknowledged',
                createdAt: new Date(Date.now() - 3600000).toISOString()
            }
        ];
    }

    /**
     * Fallback mock chart data
     */
    function useMockChartData() {
        const mockLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
        const mockData = Array.from({ length: 24 }, () => -20 + Math.random() * 10);

        temperatureChartData.value = {
            labels: mockLabels,
            datasets: [
                {
                    label: 'Temperatura Promedio',
                    data: mockData,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        };
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
        $reset,

        // Mock functions (exportadas para uso directo)
        useMockKpis,
        useMockAlerts,
        useMockChartData
    };
});