import { ref } from "vue";
import { defineStore } from "pinia";
import { AlertAssembler } from "@/monitoring/infrastructure/alerts.assembler.js";
import { MonitoringApi } from "@/monitoring/infrastructure/monitoring-api.js";
import {EquipmentAssembler} from "@/monitoring/infrastructure/equipments.assembler.js";

const monitoringApi = new MonitoringApi();

/**
 * Store for Monitoring context.
 */
const useMonitoringStore = defineStore("monitoring", () => {
    /**
     * List of equipment entities.
     * @type {import('vue').Ref<Category[]>}
     */
    const equipments = ref([]);
    /**
     * List of alert entities.
     * @type {import('vue').Ref<Category[]>}
     */
    const alerts = ref([]);
    /**
     * List of error entities.
     * @type {import('vue').Ref<Category[]>}
     */
    const errors = ref([]);

    const equipmentsLoaded = ref(false);
    const alertsLoaded = ref(false);

    /**
     * Fetches alerts from the API and updates state.
     * @function
     * @returns {void}
     */
    function fetchAlerts() {
        monitoringApi
            .getAlerts()
            .then((response) => {
                alerts.value = AlertAssembler.toEntitiesFromResponse(response);
                alertsLoaded.value = true;
                console.log("Alerts loaded:", alerts.value);
            })
            .catch((error) => {
                errors.value.push(error);
                console.error("Error loading alerts:", error);
            });
    }

    /**
     * Fetches equipments from the API and updates state.
     * @function
     * @returns {void}
     */
    function fetchEquipments() {
        monitoringApi
            .getEquipment()
            .then((response) => {
                equipments.value = EquipmentAssembler.toEntitiesFromResponse(response);
                equipmentsLoaded.value = true;
                console.log("Equipment loaded:", equipments.value);
            })
            .catch((error) => {
                errors.value.push(error);
                console.error("Error loading equipment:", error);
            });
    }

    /**
     * Deletes a alerts via the API and updates state.
     * @function
     * @param {Category} alert - The alert to delete.
     * @returns {void}
     */
    function deleteAlert(alertId) {
        return monitoringApi.deleteAlert(alertId)
            .then(() => {
                alerts.value = alerts.value.filter(a => a.id !== alertId);
            })
            .catch(error => errors.value.push(error));
    }

    function acknowledgeAlert(alertId) {
        return monitoringApi.acknowledgeAlert(alertId)
            .then(() => {
                const alert = alerts.value.find(a => a.id === alertId);
                if (alert) alert.acknowledged = "acknowledged";
            })
            .catch(error => errors.value.push(error));
    }

    return {
        equipments,
        alerts,
        errors,
        equipmentsLoaded,
        alertsLoaded,
        acknowledgeAlert,
        fetchAlerts,
        fetchEquipments,
        deleteAlert,
    };
});

export default useMonitoringStore;

