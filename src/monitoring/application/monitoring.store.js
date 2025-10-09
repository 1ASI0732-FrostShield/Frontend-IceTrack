import { ref } from "vue";
import { defineStore } from "pinia";
import { EquipmentAssembler } from "@/monitoring/infrastructure/equipments.assembler.js";
import { AlertAssembler } from "@/monitoring/infrastructure/alerts.assembler.js"; 
import { MonitoringApi } from "@/monitoring/infrastructure/monitoring-api.js";

const monitoringApi = new MonitoringApi();

const useMonitoringStore = defineStore("monitoring", () => {
    const equipments = ref([]);
    const alerts = ref([]);
    const errors = ref([]);

    const equipmentsLoaded = ref(false);
    const alertsLoaded = ref(false);

    function fetchEquipments() {
        monitoringApi
            .getEquipment()
            .then((response) => {
                equipments.value = EquipmentAssembler.toEntitiesFromResponse(response);
                equipmentsLoaded.value = true;
                console.log("Equipos cargados:", equipments.value);
            })
            .catch((error) => {
                errors.value.push(error);
                console.error("Error al cargar equipos:", error);
            });
    }

    function fetchAlerts() {
        monitoringApi
            .getAlerts()
            .then((response) => {
                alerts.value = AlertAssembler.toEntitiesFromResponse(response);
                alertsLoaded.value = true;
                console.log("Alertas cargadas:", alerts.value);
            })
            .catch((error) => {
                errors.value.push(error);
                console.error("Error al cargar alertas:", error);
            });
    }

    return {
        equipments,
        alerts,
        errors,
        equipmentsLoaded,
        alertsLoaded,
        fetchEquipments,
        fetchAlerts,
    };
});

export default useMonitoringStore;
