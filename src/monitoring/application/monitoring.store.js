import { ref } from "vue";
import { defineStore } from "pinia";
import { AlertAssembler } from "@/monitoring/infrastructure/alerts.assembler.js";
import { MonitoringApi } from "@/monitoring/infrastructure/monitoring-api.js";
import {EquipmentAssembler} from "@/monitoring/infrastructure/equipments.assembler.js";

const monitoringApi = new MonitoringApi();

const useMonitoringStore = defineStore("monitoring", () => {
    const equipments = ref([]);
    const alerts = ref([]);
    const errors = ref([]);

    const equipmentsLoaded = ref(false);
    const alertsLoaded = ref(false);

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
