import { BaseApi } from "@/shared/infrastructure/base-api.js";

const serviceRequestsEndpointPath = '/serviceRequests';
const interventionsEndpointPath = '/interventions';
const techniciansEndpointPath = '/technicians';
const reviewsEndpointPath = '/reviews';

export class ServiceRequestsApi extends BaseApi {

    constructor() {
        super();
    }

    // --- Methods for Owners ---

    createRequest(resource) {
        return this.http.post(serviceRequestsEndpointPath, resource);
    }

    getRequestsByRequester(requesterId) {
        return this.http.get(serviceRequestsEndpointPath, { params: { requesterId } });
    }

    cancelRequest(id) {
        return this.http.patch(`${serviceRequestsEndpointPath}/${id}`, { status: 'canceled', canceledAt: new Date().toISOString() });
    }

    // --- Methods for Providers ---

    getRequestsForProvider(providerId, status) {
        return this.http.get(serviceRequestsEndpointPath, { params: { assignedTo: providerId, status } });
    }

    async acceptRequest(requestId) {
        const updateResponse = await this.http.patch(`${serviceRequestsEndpointPath}/${requestId}`, { status: 'accepted' });

        if (updateResponse.status === 200) {
            const interventionResource = {
                serviceRequestId: requestId,
                technicianId: null,
                status: 'scheduled',
                summary: 'Intervention scheduled, pending technician assignment.',
                createdAt: new Date().toISOString()
            };
            await this.createIntervention(interventionResource);
        }
        return updateResponse;
    }

    rejectRequest(requestId) {
        return this.http.patch(`${serviceRequestsEndpointPath}/${requestId}`, { status: 'rejected' });
    }

    assignTechnician(requestId, technicianId) {
        return this.http.patch(`${serviceRequestsEndpointPath}/${requestId}`, { technicianId: technicianId, status: 'inProgress' });
    }

    completeRequest(requestId) {
        return this.http.patch(`${serviceRequestsEndpointPath}/${requestId}`, { status: 'completed', completedAt: new Date().toISOString() });
    }

    // --- Methods for Technicians ---

    getTechniciansByProvider(providerId) {
        return this.http.get(techniciansEndpointPath, { params: { providerId } });
    }

    createTechnician(resource) {
        return this.http.post(techniciansEndpointPath, resource);
    }

    // --- Methods for Interventions ---

    getInterventionById(interventionId) {
        return this.http.get(`${interventionsEndpointPath}/${interventionId}`);
    }

    getInterventionsByServiceRequestId(serviceRequestId) {
        return this.http.get(interventionsEndpointPath, { params: { serviceRequestId } });
    }

    createIntervention(resource) {
        return this.http.post(interventionsEndpointPath, resource);
    }

    // --- Methods for Reviews ---
    createReview(reviewData) {
        return this.http.post(reviewsEndpointPath, reviewData);
    }

    getReviewsByTechnician(technicianId) {
        return this.http.get(reviewsEndpointPath, { params: { technicianId } });
    }

    getReviewsByServiceRequest(serviceRequestId) {
        return this.http.get(reviewsEndpointPath, { params: { serviceRequestId } });
    }
}