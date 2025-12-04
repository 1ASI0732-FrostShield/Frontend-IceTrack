import { BaseApi } from "@/shared/infrastructure/base-api.js";

const dashboardConfigsEndpointPath = '/dashboard-configs';

/**
 * Dashboard Configuration API Service
 * Handles all HTTP requests related to dashboard configuration
 */
export class DashboardConfigApi extends BaseApi {

    constructor() {
        super();
    }

    /**
     * Get dashboard config by user ID
     * GET /api/v1/dashboard-configs/user/{userId}
     */
    getConfigByUserId(userId) {
        return this.http.get(`${dashboardConfigsEndpointPath}/user/${userId}`);
    }

    /**
     * Get dashboard config by config ID
     * GET /api/v1/dashboard-configs/{id}
     */
    getConfigById(id) {
        return this.http.get(`${dashboardConfigsEndpointPath}/${id}`);
    }

    /**
     * Create dashboard config
     * POST /api/v1/dashboard-configs
     */
    createConfig(data) {
        return this.http.post(dashboardConfigsEndpointPath, data);
    }

    /**
     * Update dashboard config
     * PUT /api/v1/dashboard-configs/{id}
     */
    updateConfig(id, data) {
        return this.http.put(`${dashboardConfigsEndpointPath}/${id}`, data);
    }

    /**
     * Delete dashboard config
     * DELETE /api/v1/dashboard-configs/{id}
     */
    deleteConfig(id) {
        return this.http.delete(`${dashboardConfigsEndpointPath}/${id}`);
    }

    /**
     * Add card to dashboard
     * POST /api/v1/dashboard-configs/{id}/cards
     */
    addCard(dashboardConfigId, cardData) {
        return this.http.post(`${dashboardConfigsEndpointPath}/${dashboardConfigId}/cards`, cardData);
    }

    /**
     * Remove card from dashboard
     * DELETE /api/v1/dashboard-configs/{id}/cards/{cardId}
     */
    removeCard(dashboardConfigId, cardId) {
        return this.http.delete(`${dashboardConfigsEndpointPath}/${dashboardConfigId}/cards/${cardId}`);
    }

    /**
     * Update card visibility
     * PATCH /api/v1/dashboard-configs/{id}/cards/{cardId}/visibility
     */
    updateCardVisibility(dashboardConfigId, cardId, isVisible) {
        return this.http.patch(
            `${dashboardConfigsEndpointPath}/${dashboardConfigId}/cards/${cardId}/visibility`,
            { isVisible }
        );
    }

    /**
     * Get available card types
     * GET /api/v1/dashboard-configs/available-cards
     */
    getAvailableCardTypes() {
        return this.http.get(`${dashboardConfigsEndpointPath}/available-cards`);
    }
}