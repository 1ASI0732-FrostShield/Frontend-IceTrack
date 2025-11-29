import { ServiceRequestsApi } from "../infrastructure/service-requests-api.js";
import { ServiceRequestAssembler } from "../infrastructure/service-request.assembler.js";
import { defineStore } from "pinia";
import { ref } from "vue";
import { IamApi } from "@/iam/infrastructure/iam.api.js";

const serviceRequestsApi = new ServiceRequestsApi();
const iamApi = new IamApi();

const useServiceRequestsStore = defineStore('service-requests', () => {
    const requests = ref([]);
    const requestsLoaded = ref(false);
    const errors = ref([]);

    async function fetchAuxiliaryData() {
        const [usersResponse, sitesResponse, equipmentResponse, techniciansResponse, reviewsResponse] = await Promise.all([
            iamApi.http.get('/users'),
            iamApi.http.get('/sites'),
            iamApi.http.get('/equipments'),
            iamApi.http.get('/technicians'),
            serviceRequestsApi.http.get('/reviews')
        ]);

        return {
            users: usersResponse.data,
            sites: sitesResponse.data,
            equipments: equipmentResponse.data,
            technicians: techniciansResponse.data,
            reviews: reviewsResponse.data
        };
    }

    async function fetchServiceRequests(requesterId) {
        requestsLoaded.value = false;
        errors.value = [];
        try {
            const context = await fetchAuxiliaryData();
            const response = await serviceRequestsApi.getRequestsByRequester(requesterId);

            const reviewsMap = new Set(context.reviews.map(r => r.serviceRequestId));
            const assembledRequests = ServiceRequestAssembler.toEntitiesFromResponse(response, context);

            requests.value = assembledRequests.map(req => ({
                ...req,
                hasReview: reviewsMap.has(req.id)
            }));

            requestsLoaded.value = true;
        } catch (error) {
            errors.value.push(error);
            console.error("Error loading service requests:", error);
        }
    }

    async function createRequest(requestData) {
        errors.value = [];
        try {
            await serviceRequestsApi.createRequest(requestData);
            await fetchServiceRequests(requestData.requesterId);
            return true;
        } catch (error) {
            errors.value.push(error);
            return false;
        }
    }

    async function cancelRequest(id) {
        errors.value = [];
        try {
            await serviceRequestsApi.cancelRequest(id);
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
        fetchServiceRequests,
        createRequest,
        cancelRequest
    };
});

export default useServiceRequestsStore;