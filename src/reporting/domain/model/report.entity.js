/**
 * Represents a Report entity.
 * @class
 */
export class Report {
    /**
     * Creates a new Report instance.
     * @param {Object} params - The parameters for the report.
     * @param {?number} [params.id=null] - The unique identifier for the report.
     * @param {?number} [params.tenantId=null] - The unique identifier for the tenant.
     * @param {?number} [params.equipmentId=null] - The unique identifier for the equipment.
     */
    constructor({ id = null, tenantId = null, type = '',
                equipmentId = null, generatedAt = '', title = '',
                status = '', summary = '', content = '', url = ''}) {
        this.id = id;
        this.tenantId = tenantId;
        this.type = type;
        this.equipmentId = equipmentId;
        this.generatedAt = generatedAt;
        this.title = title;
        this.status = status;
        this.summary = summary;
        this.content = content;
        this.url = url;
    }

    getFormatedGeneratedAt(){
        return this.generatedAt.toLocaleDateString('es-US', {
            year:  'numeric',
            month: '2-digit',
            day:   '2-digit',
            hour:  '2-digit',
            minute:'2-digit'
        });
    }

}