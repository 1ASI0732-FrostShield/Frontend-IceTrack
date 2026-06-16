import { defineStore } from "pinia";
import { ref } from "vue";
import { ServiceRequestsApi} from "@/service-request/infrastructure/service-requests-api.js";
import { ServiceRequestAssembler} from "@/service-request/infrastructure/service-request.assembler.js";
import { IamApi } from "@/iam/infrastructure/iam.api.js";
import { ReviewsApi } from "@/feedback/infrastructure/reviews.api.js";
import { AssetsManagementApi } from "@/assets-management/infrastructure/assets-management-api.js";
import { MonitoringApi } from "@/monitoring/infrastructure/monitoring-api.js";
import {useAuthStore} from "@/iam/application/auth.store.js";

const serviceDeliveryApi = new ServiceRequestsApi();
const iamApi = new IamApi();
const reviewsApi = new ReviewsApi();
const assetsManagementApi = new AssetsManagementApi();
const monitoringApi = new MonitoringApi();

export const useServiceRequestStore = defineStore('service-request-list', () => {
    const authStore = useAuthStore();

    const requests = ref([]);

    const requestsLoaded = ref(false);

    const errors = ref([]);

    async function fetchContextAndRequests(requesterId) {
        requestsLoaded.value = false;
        errors.value = [];
        try {
            const [usersRes, reviewsRes, sitesRes, equipmentsRes, requestsRes] = await Promise.all([
                iamApi.http.get('/users'),
                reviewsApi.getAllReviews(),
                assetsManagementApi.getSites(),
                monitoringApi.getEquipment(),
                serviceDeliveryApi.getRequestsByRequesterQuery(requesterId)
            ]);

            const ownerId = authStore.currentUserId;

            const ownerSites = sitesRes.data.filter(site => site.ownerId === ownerId);
            const ownerEquipments = equipmentsRes.data.filter(equipment => equipment.ownerId === ownerId);
            const ownerRequests = requestsRes.data.filter(request => request.ownerId === ownerId);

            const context = {
                users: usersRes.data,
                technicians: [],
                reviews: reviewsRes.data,
                sites: ownerSites,
                equipments: ownerEquipments
            };

            requests.value = ServiceRequestAssembler.toEntitiesFromResponse(ownerRequests, context);
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
