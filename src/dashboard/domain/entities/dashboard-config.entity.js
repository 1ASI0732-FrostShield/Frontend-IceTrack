/**
 * DashboardConfig Entity
 * Represents the dashboard configuration for a user
 */
export class DashboardConfig {
    constructor({
                    id = null,
                    userId = null,
                    defaultSiteId = null,
                    defaultTemperatureRange = '-20 to 5',
                    cards = []
                }) {
        this.id = id;
        this.userId = userId;
        this.defaultSiteId = defaultSiteId;
        this.defaultTemperatureRange = defaultTemperatureRange;
        this.cards = cards; // Array of DashboardCard entities
    }

    /**
     * Get visible cards sorted by order
     */
    getVisibleCards() {
        return this.cards
            .filter(card => card.isVisible)
            .sort((a, b) => a.order - b.order);
    }

    /**
     * Get card by type
     */
    getCardByType(cardType) {
        return this.cards.find(card => card.cardType === cardType);
    }

    /**
     * Check if a card type is enabled and visible
     */
    hasCard(cardType) {
        return this.cards.some(card => card.cardType === cardType && card.isVisible);
    }
}