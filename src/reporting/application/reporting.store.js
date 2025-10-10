/**
 * Pinia store for managing reports in the reporting context.
 * Encapsulates all CRUD operations and state management for reports.
 *
 * @module useReportingStore
 */
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {ReportingApi} from "@/reporting/infrastructure/reporting-api.js";
import {ReportAssembler} from "@/reporting/infrastructure/report.assembler.js";
import {Report} from "@/reporting/domain/model/report.entity.js";

const reportingApi = new ReportingApi();

/**
 * Store for reporting context.
 */
const useReportingStore = defineStore('reporting', () => {
    /**
     * List of report entities.
     * @type {import('vue').Ref<Report[]>}
     */
    const reports = ref([]);

    /**
     * List of errors encountered during API operations.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);

    /**
     * Whether reports have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const reportsLoaded = ref(false);

    /**
     * Number of loaded reports.
     * @type {import('vue').ComputedRef<number>}
     */
    const reportsCount = computed(() => {
        return reportsLoaded ? reports.value.length : 0;
    });

    /**
     * Fetches reports from the API and updates state.
     * @function
     * @returns {void}
     */
    function fetchReports() {
        reportingApi.getReports()
            .then(response => {
                reports.value = ReportAssembler.toEntitiesFromResponse(response);
                reportsLoaded.value = true;
                console.log(reportsLoaded.value);
                console.log(reports.value);
            })
            .catch(error => {
                errors.value.push(error);
            });
    }

    /**
     * Gets a report by its ID.
     * @function
     * @param id {number|string} id - The report ID.
     * @returns {Report} The found report or undefined.
     */
    function getReportById(id) {
        let idNum = parseInt(id);
        return reports.value.find(report => report["id"] === idNum);
    }

    /**
     * Adds a new report via the API and updates state.
     * @function
     * @param {Report} report - The report to add.
     * @returns {void}
     */
    function addReport(report) {
        reportingApi.createReport(report).then(response => {
            const resource = response.data;
            const newReport = ReportAssembler.toEntityFromResource(resource);
            reports.value.push(newReport);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Updates an existing report via the API and updates state.
     * @function
     * @param {Report} report - The report to update.
     * @returns {void}
     */
    function updateReport(report) {
        reportingApi.updateReport(report).then(response => {
            const resource = response.data;
            const updatedReport = ReportAssembler.toEntityFromResource(resource);
            const index = reports.value.findIndex(c => c["id"] === updatedReport.id);
            if (index !== -1) reports.value[index] = updatedReport;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Deletes a report via the API and updates state.
     * @function
     * @param {Report} report - The report to delete.
     * @returns {void}
     */
    function deleteReport(report) {
        reportingApi.deleteReport(report.id).then(() => {
            const index = reports.value.findIndex(c => c["id"] === report.id);
            if (index !== -1) reports.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    return {
        reports,
        errors,
        reportsLoaded,
        reportsCount,
        fetchReports,
        getReportById,
        addReport,
        updateReport,
        deleteReport,
    }
});

export default useReportingStore;