/**
 * DashboardCard Entity
 * Represents a card in the dashboard configuration
 */
export class DashboardCard {
    constructor({
                    id = null,
                    cardType = '',
                    order = 0,
                    isVisible = true
                }) {
        this.id = id;
        this.cardType = cardType;
        this.order = order;
        this.isVisible = isVisible;
    }

    /**
     * Get card icon based on type
     */
    getIcon() {
        const iconMap = {
            'AlertsCard': 'pi-exclamation-triangle',
            'TemperatureMonitoringCard': 'pi-chart-line',
            'EquipmentStatusCard': 'pi-sitemap',
            'RecentReportsCard': 'pi-file',
            'ServiceRequestsCard': 'pi-briefcase'
        };
        return iconMap[this.cardType] || 'pi-th-large';
    }

    /**
     * Get card color based on type
     */
    getColor() {
        const colorMap = {
            'AlertsCard': 'orange',
            'TemperatureMonitoringCard': 'blue',
            'EquipmentStatusCard': 'green',
            'RecentReportsCard': 'purple',
            'ServiceRequestsCard': 'cyan'
        };
        return colorMap[this.cardType] || 'gray';
    }
}