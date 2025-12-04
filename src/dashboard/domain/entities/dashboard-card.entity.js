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
     * Actualizado con los tipos del backend
     */
    getIcon() {
        const iconMap = {
            // Backend card types
            'MonitoredEquipment': 'pi-sitemap',
            'OpenAlerts': 'pi-exclamation-triangle',
            'ActiveOrders': 'pi-briefcase',
            'AverageTemperature': 'pi-chart-scatter',
            'TemperatureTrends': 'pi-chart-line',
            'EquipmentStatus': 'pi-server',
            'RecentReports': 'pi-file',
            'SystemHealth': 'pi-heart',
            // Legacy support
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
     * Actualizado con los tipos del backend
     */
    getColor() {
        const colorMap = {
            // Backend card types
            'MonitoredEquipment': '#3B82F6',
            'OpenAlerts': '#F59E0B',
            'ActiveOrders': '#10B981',
            'AverageTemperature': '#06B6D4',
            'TemperatureTrends': '#8B5CF6',
            'EquipmentStatus': '#EC4899',
            'RecentReports': '#6366F1',
            'SystemHealth': '#14B8A6',
            // Legacy support
            'AlertsCard': '#F59E0B',
            'TemperatureMonitoringCard': '#06B6D4',
            'EquipmentStatusCard': '#10B981',
            'RecentReportsCard': '#8B5CF6',
            'ServiceRequestsCard': '#06B6D4'
        };
        return colorMap[this.cardType] || '#6B7280';
    }
}