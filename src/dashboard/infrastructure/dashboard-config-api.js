import { BaseApi } from "@/shared/infrastructure/base-api.js";
import { BaseEndpoint } from "@/shared/infrastructure/base-endpoint.js";

const dashboardConfigsEndpointPath = import.meta.env.VITE_DASHBOARD_CONFIGS_ENDPOINT_PATH || '/dashboard-configs';

export class DashboardConfigApi extends BaseApi {
    #dashboardConfigsEndpoint;

    constructor() {
        super();
        this.#dashboardConfigsEndpoint = new BaseEndpoint(this, dashboardConfigsEndpointPath);
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
        return this.#dashboardConfigsEndpoint.getById(id);
    }

    /**
     * Create dashboard config
     * POST /api/v1/dashboard-configs
     */
    createConfig(data) {
        return this.#dashboardConfigsEndpoint.create(data);
    }

    /**
     * Update dashboard config
     * PUT /api/v1/dashboard-configs/{id}
     */
    updateConfig(id, data) {
        return this.#dashboardConfigsEndpoint.update(id, data);
    }

    /**
     * Delete dashboard config
     * DELETE /api/v1/dashboard-configs/{id}
     */
    deleteConfig(id) {
        return this.#dashboardConfigsEndpoint.delete(id);
    }

    /**
     * Add card to dashboard (custom endpoint)
     * POST /api/v1/dashboard-configs/{id}/cards
     */
    addCard(dashboardConfigId, cardData) {
        return this.http.post(`${dashboardConfigsEndpointPath}/${dashboardConfigId}/cards`, cardData);
    }

    /**
     * Remove card from dashboard (custom endpoint)
     * DELETE /api/v1/dashboard-configs/{id}/cards/{cardId}
     */
    removeCard(dashboardConfigId, cardId) {
        return this.http.delete(`${dashboardConfigsEndpointPath}/${dashboardConfigId}/cards/${cardId}`);
    }

    /**
     * Update card visibility (custom endpoint)
     * PATCH /api/v1/dashboard-configs/{id}/cards/{cardId}/visibility
     */
    updateCardVisibility(dashboardConfigId, cardId, isVisible) {
        return this.http.patch(
            `${dashboardConfigsEndpointPath}/${dashboardConfigId}/cards/${cardId}/visibility`,
            { isVisible }
        );
    }

    /**
     * Get available card types (custom endpoint)
     * GET /api/v1/dashboard-configs/available-cards
     */
    getAvailableCardTypes() {
        return this.http.get(`${dashboardConfigsEndpointPath}/available-cards`);
    }
}