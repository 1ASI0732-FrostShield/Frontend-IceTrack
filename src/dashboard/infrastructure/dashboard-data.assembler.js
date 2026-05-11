import { DashboardKpis } from "@/dashboard/domain/entities/dashboard-kpis.entity.js";

/**
 * Dashboard Data Assembler
 * Transforms API responses to domain entities for dashboard data.
 * NOTE: Alert component removed. openAlerts is always 0.
 */
export class DashboardDataAssembler {

    /**
     * Calculate KPIs from API responses.
     * @param {object} equipmentsResponse
     * @param {object|null} sitesResponse
     * @param {number} serviceRequestsCount
     */
    static toKpisFromResponses(
        equipmentsResponse,
        sitesResponse        = null,
        serviceRequestsCount = 0
    ) {
        const equipments = equipmentsResponse?.data || [];
        const sites      = sitesResponse?.data      || [];

        return new DashboardKpis({
            totalEquipments: equipments.length,
            openAlerts:      0,   // Alert component removed
            activeRequests:  serviceRequestsCount,
            totalSites:      sites.length,
            avgTemperature:  0,
            minTemperature:  0,
            maxTemperature:  0,
        });
    }

    /**
     * Transform temperature trends to chart data
     */
    static toChartDataFromTrends(trendsData) {
        if (!trendsData?.data) return null;

        const { labels, temperatures } = trendsData.data;

        return {
            labels: labels || [],
            datasets: [
                {
                    label:           'Temperatura Promedio',
                    data:            temperatures || [],
                    borderColor:     '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension:         0.4,
                    fill:            true
                }
            ]
        };
    }
}