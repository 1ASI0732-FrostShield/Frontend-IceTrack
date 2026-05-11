import { ref } from "vue";
import { defineStore } from "pinia";
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

    async function updateEquipment(equipmentData) {
        errors.value = [];
        try {
            const response = await monitoringApi.updateEquipment(equipmentData);
            const updated = EquipmentAssembler.toEntityFromResource(response.data);
            const index = equipments.value.findIndex(e => e.id === updated.id);
            if (index !== -1) equipments.value[index] = updated;
        } catch (error) {
            errors.value.push(error);
            throw error;
        }
    }

    async function deleteEquipment(equipment) {
        errors.value = [];
        try {
            await monitoringApi.deleteEquipment(equipment.id);
            const index = equipments.value.findIndex(e => e.id === equipment.id);
            if (index !== -1) equipments.value.splice(index, 1);
        } catch (error) {
            errors.value.push(error);
            throw error;
        }
    }

    return {
        equipments,
        errors,
        equipmentsLoaded,
        createEquipment,
        updateEquipment,
        deleteEquipment,
        fetchEquipments,
    };
});

export default useMonitoringStore;
