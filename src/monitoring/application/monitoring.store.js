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

    /**
     * Whether equipments have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const equipmentsLoaded = ref(false);
    /**
     * Whether alerts have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
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
     * Creates a new site via the API and updates the equipments list.
     * @param {object} equipmentData - The data for the new site.
     * @returns {Promise<void>}
     */
    async function createEquipment(equipmentData) {
        errors.value = [];
        try {
            const response = await monitoringApi.createEquipment(equipmentData);
            const newEquipment = EquipmentAssembler.toEntityFromResource(response.data);
            equipments.value.push(newEquipment);
        } catch (error) {
            errors.value.push(error);
            throw error;
        }
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
        createEquipment,
        alertsLoaded,
        acknowledgeAlert,
        fetchAlerts,
        fetchEquipments,
        deleteAlert,
    };
});

export default useMonitoringStore;
