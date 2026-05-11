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
     */
    getIcon() {
        const iconMap = {
            'MonitoredEquipment': 'pi-sitemap',
            'OpenAlerts':         'pi-exclamation-triangle',
            'Sites':              'pi-map-marker',
            'ActiveRequests':     'pi-briefcase',
        };
        return iconMap[this.cardType] || 'pi-th-large';
    }

    /**
     * Get card color based on type
     */
    getColor() {
        const colorMap = {
            'MonitoredEquipment': '#3B82F6',  // Blue
            'OpenAlerts':         '#F59E0B',  // Orange
            'Sites':              '#10B981',  // Green
            'ActiveRequests':     '#22C55E',  // Light Green
        };
        return colorMap[this.cardType] || '#6B7280';
    }
}