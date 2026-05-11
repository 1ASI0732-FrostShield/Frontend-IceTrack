import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { DashboardKpis } from "@/dashboard/domain/entities/dashboard-kpis.entity.js";
import { DashboardDataApi } from "@/dashboard/infrastructure/dashboard-data-api.js";
import { DashboardDataAssembler } from "@/dashboard/infrastructure/dashboard-data.assembler.js";
import { useAuthStore } from "@/iam/application/auth.store.js";

const dashboardDataApi = new DashboardDataApi();

export const useDashboardDataStore = defineStore('dashboardData', () => {
    // STATE
    const kpis       = ref(null);
    const equipments = ref([]);   // raw list for status breakdown
    const requests   = ref([]);   // raw list — ALL requests for the user
    const loading    = ref(false);
    const errors     = ref([]);

    // COMPUTED
    const hasData = computed(() => kpis.value && kpis.value.hasData());

    /** Equipment counts by status (case-insensitive) */
    const equipmentStatusCounts = computed(() => ({
        maintenance: equipments.value.filter(e =>
            e.status?.toLowerCase() === 'maintenance'
        ).length,
        repair: equipments.value.filter(e =>
            e.status?.toLowerCase() === 'repair'
        ).length,
    }));

    /** Service request counts by status */
    const requestStatusCounts = computed(() => {
        const normalize = (s) => (s || '').toLowerCase().replace(/\s+/g, '').trim()
        return {
            inProgress: requests.value.filter(r => normalize(r.status) === 'inprogress').length,
            pending:    requests.value.filter(r => normalize(r.status) === 'pending').length,
            completed:  requests.value.filter(r => normalize(r.status) === 'completed').length,
            canceled:   requests.value.filter(r => normalize(r.status) === 'canceled').length,
            rejected:   requests.value.filter(r => normalize(r.status) === 'rejected').length,
        }
    })

    // ACTIONS

    function loadAll(siteId = null) {
        loading.value = true;
        errors.value  = [];

        return loadKpis(siteId)
            .then(() => console.log('Dashboard data loaded. Requests:', requests.value.length, requests.value.map(r => r.status)))
            .catch(error => {
                console.error('Error loading dashboard data:', error);
                errors.value.push('Error loading dashboard data');
            })
            .finally(() => { loading.value = false; });
    }

    function loadKpis(siteId = null) {
        const authStore = useAuthStore();
        const userId    = authStore.currentUserId;

        return Promise.all([
            dashboardDataApi.getEquipments(null, siteId),
            dashboardDataApi.getSites(siteId),
            dashboardDataApi.getAllServiceRequests(userId),
        ])
            .then(([equipmentsResponse, sitesResponse, requestsResponse]) => {
                equipments.value = Array.isArray(equipmentsResponse?.data) ? equipmentsResponse.data : [];
                requests.value   = Array.isArray(requestsResponse?.data)   ? requestsResponse.data   : [];

                const activeCount = requests.value.filter(r =>
                    (r.status || '').toLowerCase().trim() === 'inprogress'
                ).length;

                kpis.value = DashboardDataAssembler.toKpisFromResponses(
                    equipmentsResponse,
                    sitesResponse,
                    activeCount
                );
            })
            .catch(error => {
                console.error('Error loading KPIs:', error);
                equipments.value = [];
                requests.value   = [];
                kpis.value = new DashboardKpis({
                    totalEquipments: 0,
                    openAlerts:      0,
                    activeRequests:  0,
                    totalSites:      0,
                    avgTemperature:  0,
                    minTemperature:  0,
                    maxTemperature:  0,
                });
            });
    }

    function refresh(siteId = null) { return loadAll(siteId); }
    function clearErrors() { errors.value = []; }
    function $reset() {
        kpis.value       = null;
        equipments.value = [];
        requests.value   = [];
        loading.value    = false;
        errors.value     = [];
    }

    return {
        kpis,
        equipments,
        requests,
        loading,
        errors,
        hasData,
        equipmentStatusCounts,
        requestStatusCounts,
        loadAll,
        loadKpis,
        refresh,
        clearErrors,
        $reset
    };
});