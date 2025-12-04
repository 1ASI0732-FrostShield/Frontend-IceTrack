import { BaseApi } from "@/shared/infrastructure/base-api.js";

/**
 * Dashboard Data API Service
 * Handles requests for KPIs, alerts, and dashboard metrics
 */
export class DashboardDataApi extends BaseApi {
    constructor() {
        super();
    }

    /**
     * Get equipments (for KPIs)
     * GET /api/v1/equipment
     */
    getEquipments(tenantId = null, siteId = null) {
        const params = {};
        if (tenantId) params.tenantId = tenantId;
        if (siteId) params.siteId = siteId;

        return this.http.get('/equipment', { params });
    }

    /**
     * Get alerts (for KPIs)
     * GET /api/v1/alert
     */
    getOpenAlerts(tenantId = null, equipmentId = null, siteId = null) {
        const params = {};
        if (tenantId) params.tenantId = tenantId;
        if (equipmentId) params.equipmentId = equipmentId;
        if (siteId) params.siteId = siteId;

        return this.http.get('/alert', { params });
    }

    /**
     * Get recent alerts for table
     * GET /api/v1/alert
     */
    getRecentAlerts(tenantId = null, siteId = null) {
        const params = {};
        if (tenantId) params.tenantId = tenantId;
        if (siteId) params.siteId = siteId;

        return this.http.get('/alert', { params });
    }

    /**
     * Get temperature trends
     * ⚠️ Este endpoint NO existe en el backend actual
     * Retorna null para indicar que no hay datos disponibles
     */
    async getTemperatureTrends(siteId = null) {
        // Endpoint no implementado - retornar null
        return null;
    }
}