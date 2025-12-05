import { defineStore } from "pinia";
import { ref } from "vue";
import { ServiceRequestsApi} from "@/service-request/infrastructure/service-requests-api.js";
import { ServiceRequestAssembler} from "@/service-request/infrastructure/service-request.assembler.js";
import { IamApi } from "@/iam/infrastructure/iam.api.js";
import { ReviewsApi } from "@/feedback/infrastructure/reviews.api.js";

const serviceDeliveryApi = new ServiceRequestsApi();
const iamApi = new IamApi();
const reviewsApi = new ReviewsApi();

/**
 * @store useServiceRequestStore
 * @description A Pinia store for managing service requests.
 * @author Kenyi Ramirez
 */
export const useServiceRequestStore = defineStore('service-request-list', () => {
    const requests = ref([]);
    const requestsLoaded = ref(false);
    const errors = ref([]);

    /**
     * @function fetchContextAndRequests
     * @description Fetches all necessary context (users, technicians, reviews) and the service requests for a given requester.
     * @param {number} requesterId - The ID of the user who made the requests.
     * @async
     */
    async function fetchContextAndRequests(requesterId) {
        requestsLoaded.value = false;
        errors.value = [];
        try {
            const [usersRes, techsRes, reviewsRes, requestsRes] = await Promise.all([
                iamApi.http.get('/users'),
                iamApi.http.get('/technicians'),
                reviewsApi.getAllReviews(),
                serviceDeliveryApi.getRequestsByRequesterQuery(requesterId)
            ]);

            const context = {
                users: usersRes.data,
                technicians: techsRes.data,
                reviews: reviewsRes.data
            };

            requests.value = ServiceRequestAssembler.toEntitiesFromResponse(requestsRes.data, context);
            requestsLoaded.value = true;
        } catch (error) {
            errors.value.push(error);
            console.error("Error loading service requests:", error);
        }
    }

    /**
     * @function cancelRequest
     * @description Sends a command to cancel a service request and updates its status locally.
     * @param {number} id - The ID of the service request to cancel.
     * @async
     */
    async function cancelRequest(id) {
        errors.value = [];
        try {
            await serviceDeliveryApi.sendCancelRequestCommand(id);
            const index = requests.value.findIndex(req => req.id === id);
            if (index !== -1) {
                requests.value[index].status = 'canceled';
            }
        } catch (error) {
            errors.value.push(error);
        }
    }

    return {
        requests,
        requestsLoaded,
        errors,
        fetchContextAndRequests,
        cancelRequest
    };
});
