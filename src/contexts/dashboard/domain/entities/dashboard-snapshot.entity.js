export class DashboardSnapshot {
    constructor({ id, tenantId, updatedAt, kpis = {}, trends = {} }) {
        this.id = id
        this.tenantId = tenantId
        this.updatedAt = updatedAt ? new Date(updatedAt) : new Date()
        this.kpis = kpis
        this.trends = {
            temperature: {
                labels: trends?.temperature?.labels || [],
                avg: trends?.temperature?.avg || []
            },
            energy: {
                labels: trends?.energy?.labels || [],
                kwh: trends?.energy?.kwh || []
            }
        }
    }

    get temperatureChartData() {
        return {
            labels: this.trends.temperature.labels,
            datasets: [{
                label: '°C',
                data: this.trends.temperature.avg,
                tension: 0.35,
                fill: true,
                borderColor: 'rgba(3, 169, 244, 1)',
                backgroundColor: 'rgba(3, 169, 244, 0.1)',
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        }
    }

    get avgTemperature() {
        const temps = this.trends.temperature.avg
        if (!temps || temps.length === 0) return 0
        const sum = temps.reduce((acc, val) => acc + val, 0)
        return sum / temps.length
    }
}
