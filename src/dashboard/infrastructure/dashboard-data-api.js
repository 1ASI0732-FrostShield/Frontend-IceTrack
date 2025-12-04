import { BaseApi } from "@/shared/infrastructure/base-api.js";
import { BaseEndpoint } from "@/shared/infrastructure/base-endpoint.js";

/**
 * Dashboard Data API Service
 * Handles requests for KPIs, alerts, and dashboard metrics
 */
export class DashboardDataApi extends BaseApi {
    #equipmentsEndpoint;
    #alertsEndpoint;
    #reportsEndpoint;

    constructor() {
        super();
        this.#equipmentsEndpoint = new BaseEndpoint(this, '/equipments');
        this.#alertsEndpoint = new BaseEndpoint(this, '/alert');
        this.#reportsEndpoint = new BaseEndpoint(this, '/reports');
    }

    /**
     * Get equipments (for KPIs)
     * GET /api/v1/equipments?siteId={siteId}
     */
    getEquipments(siteId = null) {
        const params = siteId ? { siteId } : {};
        return this.#equipmentsEndpoint.getAll(params);
    }

    /**
     * Get open alerts (for KPIs)
     * GET /api/v1/alert?status=open&siteId={siteId}
     */
    getOpenAlerts(siteId = null) {
        const params = { status: 'open' };
        if (siteId) params.siteId = siteId;
        return this.#alertsEndpoint.getAll(params);
    }

    /**
     * Get recent alerts for table
     * GET /api/v1/alert?siteId={siteId}&_limit=5&_sort=date&_order=desc
     */
    getRecentAlerts(siteId = null, limit = 5) {
        const params = {
            _limit: limit,
            _sort: 'date',
            _order: 'desc'
        };
        if (siteId) params.siteId = siteId;
        return this.#alertsEndpoint.getAll(params);
    }

    /**
     * Get temperature trends (mock for now - replace with real endpoint)
     * TODO: Replace with actual monitoring endpoint when available
     */
    async getTemperatureTrends(siteId = null) {
        // Mock data for now
        return {
            status: 200,
            data: {
                labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                temperatures: Array.from({ length: 24 }, () => -20 + Math.random() * 10)
            }
        };
    }
}