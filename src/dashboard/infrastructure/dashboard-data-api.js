import { BaseApi } from "@/shared/infrastructure/base-api.js";

/**
 * Dashboard Data API Service
 * Handles requests for KPIs, alerts, and dashboard metrics
 * ONLY includes endpoints that exist in the backend
 */
export class DashboardDataApi extends BaseApi {
    constructor() {
        super();
    }

    /**
     * Get equipments (for MonitoredEquipment KPI)
     * GET /api/v1/equipment
     * ✅ Endpoint exists and works
     */
    getEquipments(tenantId = null, siteId = null) {
        const params = {};
        if (tenantId) params.tenantId = tenantId;
        if (siteId) params.siteId = siteId;

        return this.http.get('/equipment', { params });
    }

    /**
     * Get alerts (for OpenAlerts KPI)
     * GET /api/v1/alert
     * ✅ Endpoint exists (currently returns 500 - needs backend fix)
     */
    getOpenAlerts(tenantId = null, equipmentId = null, siteId = null) {
        const params = {};
        if (tenantId) params.tenantId = tenantId;
        if (equipmentId) params.equipmentId = equipmentId;
        if (siteId) params.siteId = siteId;

        return this.http.get('/alert', { params });
    }

    /**
     * Get recent alerts for table display
     * GET /api/v1/alert
     * ✅ Same endpoint as above
     */
    getRecentAlerts(tenantId = null, siteId = null) {
        const params = {};
        if (tenantId) params.tenantId = tenantId;
        if (siteId) params.siteId = siteId;

        return this.http.get('/alert', { params });
    }
}