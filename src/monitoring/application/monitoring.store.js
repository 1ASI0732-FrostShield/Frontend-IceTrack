import { ref } from "vue";
import { defineStore } from "pinia";
import { EquipmentAssembler } from "@/monitoring/infrastructure/equipments.assembler.js";
import { MonitoringApi } from "@/monitoring/infrastructure/monitoring-api.js";

const monitoringApi = new MonitoringApi();

const useMonitoringStore = defineStore('monitoring', () => {
    const equipments = ref([]);
    const errors = ref([]);
    const equipmentsLoaded = ref(false);

    function fetchEquipments() {
        monitoringApi.getEquipment().then(response => {
            equipments.value = EquipmentAssembler.toEntitiesFromResponse(response);
            equipmentsLoaded.value = true;
            console.log(equipmentsLoaded.value);
            console.log(equipments.value);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    return {
        equipments,
        errors,
        equipmentsLoaded,
        fetchEquipments,
    }
});

export default useMonitoringStore;