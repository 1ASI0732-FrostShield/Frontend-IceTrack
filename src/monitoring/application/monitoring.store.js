import { ref } from "vue";
import { defineStore } from "pinia";
import { MonitoringApi } from "@/monitoring/infrastructure/monitoring-api.js";
import {EquipmentAssembler} from "@/monitoring/infrastructure/equipments.assembler.js";

const monitoringApi = new MonitoringApi();

const useMonitoringStore = defineStore("monitoring", () => {
    const equipments = ref([]);

    const errors = ref([]);

    const equipmentsLoaded = ref(false);

    function fetchEquipments() {
        monitoringApi
            .getEquipment()
            .then((response) => {
                const allEquipments = EquipmentAssembler.toEntitiesFromResponse(response);
                equipments.value = allEquipments.filter(equipment => equipment.ownerId === authStore.currentUserId);
                equipmentsLoaded.value = true;
                console.log("Equipment loaded:", equipments.value);
            })
            .catch((error) => {
                errors.value.push(error);
                console.error("Error loading equipment:", error);
            });
    }

    async function createEquipment(equipmentData) {
        errors.value = [];
        try {
            const response = await monitoringApi.createEquipment({
                ...equipmentData,
                ownerId: authStore.currentUserId
            });
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
