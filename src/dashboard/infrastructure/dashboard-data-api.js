import { BaseApi } from "@/shared/infrastructure/base-api.js";

const equipmentsPath = import.meta.env.VITE_EQUIPMENTS_ENDPOINT_PATH || '/equipment';
const sitesPath      = import.meta.env.VITE_SITES_ENDPOINT_PATH      || '/sites';

/**
 * Dashboard Data API Service
 */
export class DashboardDataApi extends BaseApi {
    constructor() {
        super();
    }

    getEquipments(tenantId = null, siteId = null) {
        const params = {};
        if (tenantId) params.tenantId = tenantId;
        if (siteId)   params.siteId   = siteId;
        return this.http.get(equipmentsPath, { params });
    }

    getSites(siteId = null) {
        const params = {};
        if (siteId) params.siteId = siteId;
        return this.http.get(sitesPath, { params });
    }

    /**
     * Get ALL service requests for a requester (no status filter)
     * Uses same endpoint as ServiceRequestsApi.getRequestsByRequesterQuery
     */
    getAllServiceRequests(requesterId = null) {
        if (requesterId) {
            return this.http.get(`/service-requests/requester/${requesterId}`);
        }
        return this.http.get('/service-requests');
    }
}