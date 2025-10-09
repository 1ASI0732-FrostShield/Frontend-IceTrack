import { ref } from "vue";
import { defineStore } from "pinia";
import { SitesAssembler } from "@/assets-management/infrastructure/sites.assembler.js";
import { AssetsManagementApi } from "@/assets-management/infrastructure/assets-management-api.js";

const assetsManagementApi = new AssetsManagementApi();

const useAssetsManagementStore = defineStore('assetsManagement', () => {
    const sites = ref([]);
    const errors = ref([]);
    const sitesLoaded = ref(false);

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

    return {
        sites,
        errors,
        sitesLoaded,
        fetchSites,
    }
});

export default useAssetsManagementStore;