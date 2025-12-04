import { defineStore } from "pinia";
import { ref } from "vue";
import { ServiceRequestsApi} from "@/service-request/infrastructure/service-requests-api.js";
import { ServiceRequestAssembler} from "@/service-request/infrastructure/service-request.assembler.js";
import { IamApi } from "@/iam/infrastructure/iam.api.js";
import { ReviewsApi } from "@/feedback/infrastructure/reviews.api.js";

const serviceDeliveryApi = new ServiceRequestsApi();
const iamApi = new IamApi();
const reviewsApi = new ReviewsApi();

export const useServiceRequestStore = defineStore('service-request-list', () => {
    const requests = ref([]);
    const requestsLoaded = ref(false);
    const errors = ref([]);

    async function fetchContextAndRequests(requesterId) {
        requestsLoaded.value = false;
        errors.value = [];
        try {
            const [usersRes, techsRes, reviewsRes, requestsRes] = await Promise.all([
                iamApi.http.get('/users'),
                // iamApi.http.get('/sites'), // Not implemented yet
                // iamApi.http.get('/equipments'), // Not implemented yet
                iamApi.http.get('/technicians'),
                reviewsApi.getAllReviews(),
                serviceDeliveryApi.getRequestsByRequesterQuery(requesterId)
            ]);

            const context = {
                users: usersRes.data,
                // sites: sitesRes.data,
                // equipments: equipRes.data,
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
