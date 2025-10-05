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
        const [usersResponse, sitesResponse, equipmentResponse, reportsResponse] = await Promise.all([
            baseApi.http.get('/users'),
            baseApi.http.get('/sites'),
            baseApi.http.get('/equipments'),
            baseApi.http.get('/reports')
        ]);

        return {
            users: usersResponse.data,
            sites: sitesResponse.data,
            equipments: equipmentResponse.data,
            reports: reportsResponse.data
        };
    }

    async function fetchServiceRequests(currentUserId) {
        requestsLoaded.value = false;
        errors.value = [];
        try {
            // 1. Obtener datos auxiliares (users, sites, equipments, reports)
            const context = await fetchAuxiliaryData();

            // 2. Obtener todas las Service Requests
            const response = await serviceRequestsApi.getAllRequests();

            // 3. Ensamblar y filtrar
            const allRequests = ServiceRequestAssembler.toEntitiesFromResponse(response, context);
            requests.value = allRequests.filter(req => req.requesterId === currentUserId);

            requestsLoaded.value = true;
        } catch (error) {
            errors.value.push(error);
        }
    }

    function getRequestById(id) {
        return requests.value.find(req => req.id === id);
    }

    async function createRequest(requestData) {
        errors.value = [];
        try {
            const response = await serviceRequestsApi.createRequest(requestData);
            const context = await fetchAuxiliaryData(); // Obtener contexto actualizado
            const newRequest = ServiceRequestAssembler.toEntityFromResource(response.data, context);
            requests.value.unshift(newRequest); // Agregar al inicio
        } catch (error) {
            errors.value.push(error);
        }
    }

    async function cancelRequest(id) {
        errors.value = [];
        try {
            // La API actualiza el status a 'canceled'
            await serviceRequestsApi.cancelRequest(id);

            // Actualizar el estado local
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