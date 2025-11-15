import { ServiceRequestsApi } from "../infrastructure/service-requests-api.js";
import { ServiceRequestAssembler } from "../infrastructure/service-request.assembler.js";
import { defineStore } from "pinia";
import { ref } from "vue";
import { BaseApi} from "@/shared/infrastructure/base-api.js";

const serviceRequestsApi = new ServiceRequestsApi();
const baseApi = new BaseApi();

const useServiceRequestsStore = defineStore('service-requests', () => {
    const requests = ref([]);
    const requestsLoaded = ref(false);
    const errors = ref([]);

    async function fetchAuxiliaryData() {
        const extractArray = (response, key) => {
            if (!response || !response.data) return [];
            if (response.data[key]) return response.data[key];
            if (Array.isArray(response.data)) return response.data;
            return [];
        };

        const [usersResponse, sitesResponse, equipmentResponse, reportsResponse] = await Promise.all([
            baseApi.http.get('/users'),
            baseApi.http.get('/sites'),
            baseApi.http.get('/equipments'),
            baseApi.http.get('/reports')
        ]);

        return {
            users: extractArray(usersResponse, 'users'),
            sites: extractArray(sitesResponse, 'sites'),
            equipments: extractArray(equipmentResponse, 'equipments'),
            reports: extractArray(reportsResponse, 'reports')
        };
    }

    async function fetchServiceRequests(currentTenantId) {
        requestsLoaded.value = false;
        errors.value = [];
        try {
            const context = await fetchAuxiliaryData();
            const response = await serviceRequestsApi.getAllRequests();

            const allRequests = ServiceRequestAssembler.toEntitiesFromResponse(response, context);
            requests.value = allRequests.filter(req => req.tenantId === currentTenantId);

            requestsLoaded.value = true;
        } catch (error) {
            errors.value.push(error);
            console.error("Error al cargar service requests:", error);
        }
    }

    function getRequestById(id) {
        return requests.value.find(req => req.id === id);
    }

    async function createRequest(requestData) {
        errors.value = [];
        try {
            const response = await serviceRequestsApi.createRequest(requestData);

            const context = await fetchAuxiliaryData();
            const newRequest = ServiceRequestAssembler.toEntityFromResource(response.data, context);

            if (newRequest.tenantId === requestData.tenantId) {
                requests.value.unshift(newRequest);
            }
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
                requests.value[index].canceledAt = new Date().toISOString();
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
        getRequestById,
        createRequest,
        cancelRequest
    };
});

export default useServiceRequestsStore;