/**
 * DashboardCard Entity
 * Represents a card in the dashboard configuration
 * ONLY includes card types with available backend endpoints
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
     * ONLY cards with available endpoints
     */
    getIcon() {
        const iconMap = {
            'MonitoredEquipment': 'pi-sitemap',
            'OpenAlerts': 'pi-exclamation-triangle'
        };
        return iconMap[this.cardType] || 'pi-th-large';
    }

    /**
     * Get card color based on type
     * ONLY cards with available endpoints
     */
    getColor() {
        const colorMap = {
            // ✅ Available endpoints
            'MonitoredEquipment': '#3B82F6',  // Blue
            'OpenAlerts': '#F59E0B'           // Orange
            // ❌ Removed: TemperatureTrends, SystemHealth, EquipmentStatus, RecentReports
        };
        return colorMap[this.cardType] || '#6B7280';
    }
}