import axios from 'axios'

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
})

export class DashboardApi {
    async getSnapshotByTenant(tenantId) {
        try {
            return await http.get('/dashboard', {
                params: {
                    tenantId,
                    _limit: 1
                }
            })
        } catch (error) {
            console.error('[DashboardApi] Error fetching snapshot:', error)
            throw error
        }
    }

    async getRecentAlerts(tenantId, limit = 5) {
        try {
            return await http.get('/alerts', {
                params: {
                    tenantId,
                    _sort: 'createdAt',
                    _order: 'desc',
                    _limit: limit
                }
            })
        } catch (error) {
            console.error('[DashboardApi] Error fetching alerts:', error)
            throw error
        }
    }

    async getEquipmentsByIds(ids) {
        if (!ids || ids.length === 0) {
            return { data: [] }
        }

        try {
            const params = new URLSearchParams()
            ids.forEach(id => params.append('id', id))

            return await http.get('/equipments', {params})
        } catch (error) {
            console.error('[DashboardApi] Error fetching equipments:', error)
            return { data: [] }
        }
    }

    async getSitesByIds(ids) {
        if (!ids || ids.length === 0) {
            return { data: [] }
        }

        try {
            const params = new URLSearchParams()
            ids.forEach(id => params.append('id', id))

            return await http.get('/sites', {params})
        } catch (error) {
            console.error('[DashboardApi] Error fetching sites:', error)
            return { data: [] }
        }
    }
}
