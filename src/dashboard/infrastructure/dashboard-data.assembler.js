import { DashboardKpis } from "@/dashboard/domain/entities/dashboard-kpis.entity.js";

/**
 * Dashboard Data Assembler
 * Transforms API responses to domain entities for dashboard data
 */
export class DashboardDataAssembler {

    /**
     * Calculate KPIs from API responses
     */
    static toKpisFromResponses(equipmentsResponse, alertsResponse, serviceRequestsCount = 0) {
        const equipments = equipmentsResponse?.data || [];
        const alerts = alertsResponse?.data || [];

        // Calculate temperature statistics from equipments
        const temperatures = equipments
            .map(e => e.currentTemperature)
            .filter(t => t != null && !isNaN(t));

        const avgTemp = temperatures.length > 0
            ? temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length
            : 0;

        const minTemp = temperatures.length > 0 ? Math.min(...temperatures) : 0;
        const maxTemp = temperatures.length > 0 ? Math.max(...temperatures) : 0;

        return new DashboardKpis({
            totalEquipments: equipments.length,
            openAlerts: alerts.length,
            activeRequests: serviceRequestsCount,
            avgTemperature: avgTemp,
            minTemperature: minTemp,
            maxTemperature: maxTemp
        });
    }

    /**
     * Transform alerts response to view objects
     */
    static toAlertsFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }

        const alerts = response.data || [];

        return alerts.map(alert => ({
            id: alert.id,
            equipmentName: alert.equipmentName || `Equipment ${alert.equipmentId}`,
            siteName: alert.siteName || `Site ${alert.siteId}`,
            severity: alert.severity?.toLowerCase() || 'info',
            status: alert.status || 'open',
            createdAt: alert.date || alert.createdAt || new Date().toISOString()
        }));
    }

    /**
     * Transform temperature trends to chart data
     */
    static toChartDataFromTrends(trendsData) {
        if (!trendsData?.data) {
            return null;
        }

        const { labels, temperatures } = trendsData.data;

        return {
            labels: labels || [],
            datasets: [
                {
                    label: 'Temperatura Promedio',
                    data: temperatures || [],
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        };
    }
}