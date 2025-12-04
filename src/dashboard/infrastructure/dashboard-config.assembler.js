import { DashboardConfig } from "@/dashboard/domain/entities/dashboard-config.entity.js";
import { DashboardCard } from "@/dashboard/domain/entities/dashboard-card.entity.js";

/**
 * Dashboard Configuration Assembler
 * Transforms API responses to domain entities and vice versa
 */
export class DashboardConfigAssembler {

    /**
     * Convert API resource to DashboardConfig entity
     */
    static toEntityFromResource(resource) {
        if (!resource) return null;

        const cards = resource.cards?.map(cardResource =>
            new DashboardCard({
                id: cardResource.id,
                cardType: cardResource.cardType,
                order: cardResource.order,
                isVisible: cardResource.isVisible
            })
        ) || [];

        return new DashboardConfig({
            id: resource.id,
            userId: resource.userId,
            defaultSiteId: resource.defaultSiteId,
            defaultTemperatureRange: resource.defaultTemperatureRange,
            cards: cards
        });
    }

    /**
     * Convert API response to DashboardConfig entity
     */
    static toEntityFromResponse(response) {
        if (response.status !== 200 && response.status !== 201) {
            console.error(`${response.status}, ${response.statusText}`);
            return null;
        }

        return this.toEntityFromResource(response.data);
    }

    /**
     * Convert DashboardConfig entity to API resource for creation
     */
    static toCreateResourceFromEntity(entity, userId) {
        return {
            userId: userId,
            defaultSiteId: entity.defaultSiteId || null,
            defaultTemperatureRangeValue: entity.defaultTemperatureRange
        };
    }

    /**
     * Convert DashboardConfig entity to API resource for update
     */
    static toUpdateResourceFromEntity(entity) {
        return {
            defaultSiteId: entity.defaultSiteId || null,
            defaultTemperatureRangeValue: entity.defaultTemperatureRange
        };
    }

    /**
     * Convert card data to API resource for adding card
     */
    static toAddCardResource(cardType, order, isVisible = true) {
        return {
            cardType: cardType,
            order: order,
            isVisible: isVisible
        };
    }

    /**
     * Convert available card types response to array
     */
    static toCardTypesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }

        return response.data || [];
    }
}