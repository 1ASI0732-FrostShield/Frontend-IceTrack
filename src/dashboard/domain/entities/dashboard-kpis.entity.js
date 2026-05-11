/**
 * DashboardKpis Entity
 * Represents the KPIs data shown in the dashboard
 * This data comes from other APIs (equipments, alerts, reports)
 */
export class DashboardKpis {
    constructor({
                    totalEquipments = 0,
                    openAlerts = 0,
                    activeRequests = 0,
                    totalSites = 0,
                    avgTemperature = 0,
                    minTemperature = 0,
                    maxTemperature = 0
                }) {
        this.totalEquipments = totalEquipments;
        this.openAlerts = openAlerts;
        this.activeRequests = activeRequests;
        this.totalSites = totalSites;
        this.avgTemperature = avgTemperature;
        this.minTemperature = minTemperature;
        this.maxTemperature = maxTemperature;
    }

    /**
     * Check if we have valid data
     */
    hasData() {
        return this.totalEquipments > 0 ||
            this.openAlerts > 0 ||
            this.activeRequests > 0 ||
            this.totalSites > 0;
    }

    /**
     * Get formatted average temperature
     */
    getFormattedAvgTemp() {
        return this.avgTemperature ? `${this.avgTemperature.toFixed(1)} °C` : '-';
    }
}