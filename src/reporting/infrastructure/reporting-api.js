import {BaseApi} from "@/shared/infrastructure/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/base-endpoint.js";

const baseUrl = import.meta.env.VITE_API_BASE_URL;
const reportsEndpointPath = import.meta.env.VITE_REPORTS_ENDPOINT_PATH;

/**
 * ReportingApi class to handle API operations for Publishing context.
 * Extends BaseApi and provides CRUD operations for reports.
 *
 * @class
 * @extends BaseApi
 * @example
 * const reportingApi = new ReportingApi();
 * reportingApi.getCategories().then(response => console.log(response.data));
 */
export class ReportingApi extends BaseApi {
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #reportsEndpoint;

    /**
     * Initializes endpoints for reports.
     */
    constructor() {
        super();
        this.#reportsEndpoint = new BaseEndpoint(this, reportsEndpointPath);
    }

    /**
     * Fetches all reports.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the report's response.
     */
    getReports() {
        return this.#reportsEndpoint.getAll();
    }

    /**
     * Fetches a report by its ID.
     * @param {number|string} id - The ID of the report.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the report response.
     */
    getReportById(id) {
        return this.#reportsEndpoint.getById(id);
    }

    /**
     * Creates a new report.
     * @param {Object} resource - The report data to create.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created report response.
     */
    createReport(resource) {
        return this.#reportsEndpoint.create(resource);
    }

    /**
     * Updates an existing report.
     * @param {Object} resource - The report data to update (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated report response.
     */
    updateReport(resource) {
        return this.#reportsEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a report by its ID.
     * @param {number|string} id - The ID of the report to delete.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteReport(id) {
        return this.#reportsEndpoint.delete(id);
    }
}