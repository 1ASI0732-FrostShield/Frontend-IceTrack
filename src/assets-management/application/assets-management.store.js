import { ref } from "vue";
import { defineStore } from "pinia";
import { SitesAssembler } from "@/assets-management/infrastructure/sites.assembler.js";
import { AssetsManagementApi } from "@/assets-management/infrastructure/assets-management-api.js";

const assetsManagementApi = new AssetsManagementApi();

/**
 * Store for Assets Management context.
 */
const useAssetsManagementStore = defineStore('assetsManagement', () => {
    /**
     * List of site entities.
     * @type {import('vue').Ref<Site[]>}
     */
    const sites = ref([]);
    /**
     * List of errors encountered during API operations.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);
    /**
     * Whether sites have been loaded from the API.
     * @type {import('vue').Ref<boolean>}
     */
    const sitesLoaded = ref(false);

    /**
     * Fetches sites from the API and updates state.
     * @function
     * @returns {void}
     */
    function fetchSites() {
        assetsManagementApi.getSites().then(response => {
            sites.value = SitesAssembler.toEntitiesFromResponse(response);
            sitesLoaded.value = true;
            console.log(sitesLoaded.value);
            console.log(sites.value);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Creates a new site via the API and updates the sites list.
     * @param {object} siteData - The data for the new site.
     * @returns {Promise<void>}
     */
    async function createSite(siteData) {
        errors.value = [];
        try {
            const response = await assetsManagementApi.createSite(siteData);
            const newSite = SitesAssembler.toEntityFromResource(response.data);
            sites.value.push(newSite);
        } catch (error) {
            errors.value.push(error);
            throw error;
        }
    }

    return {
        sites,
        errors,
        sitesLoaded,
        fetchSites,
        createSite,
    }
});


export default useAssetsManagementStore;
