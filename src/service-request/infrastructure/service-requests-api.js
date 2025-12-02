import { BaseApi} from "@/shared/infrastructure/base-api.js";

const serviceRequestsPath = '/service-requests';
const interventionsPath = '/interventions';

export class ServiceRequestsApi extends BaseApi {
    constructor() {
        super();
    }

    // --- Commands ---

    sendNewRequestCommand(command) {
        return this.http.post(serviceRequestsPath, command);
    }

    sendAcceptRequestCommand(requestId) {
        return this.http.patch(`${serviceRequestsPath}/${requestId}/accept`);
    }

    sendRejectRequestCommand(requestId) {
        return this.http.patch(`${serviceRequestsPath}/${requestId}/reject`);
    }

    sendCancelRequestCommand(requestId) {
        return this.http.patch(`${serviceRequestsPath}/${requestId}/cancel`);
    }

    sendAssignTechnicianCommand(requestId, technicianId) {
        return this.http.patch(`${serviceRequestsPath}/${requestId}/assign-technician`, { technicianId });
    }

    sendCompleteRequestCommand(requestId) {
        return this.http.patch(`${serviceRequestsPath}/${requestId}/complete`);
    }

    sendRecordInterventionCommand(command) {
        return this.http.post(interventionsPath, command);
    }

    // --- Queries ---

    getRequestsByRequesterQuery(requesterId) {
        return this.http.get(`${serviceRequestsPath}/requester/${requesterId}`);
    }

    getRequestsForProviderQuery(providerId, status = null) {
        const params = {};
        if (status) {
            params.status = status;
        }
        return this.http.get(`${serviceRequestsPath}/provider/${providerId}`, { params });
    }

    getServiceRequestDetailsQuery(requestId) {
        return this.http.get(`${serviceRequestsPath}/${requestId}`);
    }

    getInterventionsByRequestQuery(serviceRequestId) {
        return this.http.get(`${interventionsPath}/serviceRequest/${serviceRequestId}`);
    }

    getInterventionDetailsQuery(interventionId) {
        return this.http.get(`${interventionsPath}/${interventionId}`);
    }
}