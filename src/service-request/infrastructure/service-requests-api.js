import { BaseApi} from "@/shared/infrastructure/base-api.js";

const serviceRequestsPath = '/service-requests';
const interventionsPath = '/interventions';

/**
 * @class ServiceRequestsApi
 * @description A class for interacting with the service requests and interventions API.
 * @extends BaseApi
 * @author Kenyi Ramirez
 */
export class ServiceRequestsApi extends BaseApi {
    constructor() {
        super();
    }

    // --- Commands ---

    /**
     * @description Send a command to create a new service request.
     * @param {object} command - The new request command.
     * @returns {Promise<object>}
     */
    sendNewRequestCommand(command) {
        return this.http.post(serviceRequestsPath, command);
    }

    /**
     * @description Send a command to accept a service request.
     * @param {number} requestId - The ID of the request to accept.
     * @returns {Promise<object>}
     */
    sendAcceptRequestCommand(requestId) {
        return this.http.patch(`${serviceRequestsPath}/${requestId}/accept`);
    }

    /**
     * @description Send a command to reject a service request.
     * @param {number} requestId - The ID of the request to reject.
     * @returns {Promise<object>}
     */
    sendRejectRequestCommand(requestId) {
        return this.http.patch(`${serviceRequestsPath}/${requestId}/reject`);
    }

    /**
     * @description Send a command to cancel a service request.
     * @param {number} requestId - The ID of the request to cancel.
     * @returns {Promise<object>}
     */
    sendCancelRequestCommand(requestId) {
        return this.http.patch(`${serviceRequestsPath}/${requestId}/cancel`);
    }

    /**
     * @description Send a command to assign a technician to a service request.
     * @param {number} requestId - The ID of the request.
     * @param {number} technicianId - The ID of the technician to assign.
     * @returns {Promise<object>}
     */
    sendAssignTechnicianCommand(requestId, technicianId) {
        return this.http.patch(`${serviceRequestsPath}/${requestId}/assign-technician`, { technicianId });
    }

    /**
     * @description Send a command to complete a service request.
     * @param {number} requestId - The ID of the request to complete.
     * @returns {Promise<object>}
     */
    sendCompleteRequestCommand(requestId) {
        return this.http.patch(`${serviceRequestsPath}/${requestId}/complete`);
    }

    /**
     * @description Send a command to record a new intervention.
     * @param {object} command - The new intervention command.
     * @returns {Promise<object>}
     */
    sendRecordInterventionCommand(command) {
        return this.http.post(interventionsPath, command);
    }

    // --- Queries ---

    /**
     * @description Get all service requests made by a specific requester.
     * @param {number} requesterId - The ID of the requester.
     * @returns {Promise<object>}
     */
    getRequestsByRequesterQuery(requesterId) {
        return this.http.get(`${serviceRequestsPath}/requester/${requesterId}`);
    }

    /**
     * @description Get all service requests for a specific provider, optionally filtered by status.
     * @param {number} providerId - The ID of the provider.
     * @param {string|null} status - The status to filter by.
     * @returns {Promise<object>}
     */
    getRequestsForProviderQuery(providerId, status = null) {
        const params = {};
        if (status) {
            params.status = status;
        }
        return this.http.get(`${serviceRequestsPath}/provider/${providerId}`, { params });
    }

    /**
     * @description Get the details of a specific service request.
     * @param {number} requestId - The ID of the request.
     * @returns {Promise<object>}
     */
    getServiceRequestDetailsQuery(requestId) {
        return this.http.get(`${serviceRequestsPath}/${requestId}`);
    }

    /**
     * @description Get all interventions for a specific service request.
     * @param {number} serviceRequestId - The ID of the service request.
     * @returns {Promise<object>}
     */
    getInterventionsByRequestQuery(serviceRequestId) {
        return this.http.get(`${interventionsPath}/serviceRequest/${serviceRequestId}`);
    }

    /**
     * @description Get the details of a specific intervention.
     * @param {number} interventionId - The ID of the intervention.
     * @returns {Promise<object>}
     */
    getInterventionDetailsQuery(interventionId) {
        return this.http.get(`${interventionsPath}/${interventionId}`);
    }
}
