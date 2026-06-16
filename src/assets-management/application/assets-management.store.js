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
            const allSites = SitesAssembler.toEntitiesFromResponse(response);
            sites.value = allSites.filter(site => site.ownerId === authStore.currentUserId);
            sitesLoaded.value = true;
            console.log(sitesLoaded.value);
            console.log(sites.value);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    async function createSite(siteData) {
        errors.value = [];
        try {
            const response = await assetsManagementApi.createSite({
                ...siteData,
                ownerId: authStore.currentUserId
            });
            const newSite = SitesAssembler.toEntityFromResource(response.data);
            sites.value.push(newSite);
        } catch (error) {
            errors.value.push(error);
            throw error;
        }
    }

    async function updateSite(site) {
        errors.value = [];
        try {
            const response = await assetsManagementApi.updateSite(site);
            const updatedSite = SitesAssembler.toEntityFromResource(response.data);
            const index = sites.value.findIndex(s => s.id === updatedSite.id);
            if (index !== -1) sites.value[index] = updatedSite;
        } catch (error) {
            errors.value.push(error);
            throw error;
        }
    }

    function deleteSite(site) {
        assetsManagementApi.deleteSite(site.id).then(() => {
            const index = sites.value.findIndex(s => s["id"] === site.id);
            if (index !== -1) sites.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    return {
        sites,
        errors,
        sitesLoaded,
        fetchSites,
        createSite,
        updateSite,
        deleteSite,
    }
});

export default useAssetsManagementStore;