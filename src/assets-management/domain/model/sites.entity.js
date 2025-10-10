export class Sites {
    constructor({
                    id = null, tenantId = null, name = '', address = '', contactName = '',
                    contactPhone = '', createdAt = '', updatedAt = ''
                }) {
        this.id = id;
        this.tenantId = tenantId;
        this.name = name;
        this.address = address;
        this.contactName = contactName;
        this.contactPhone = contactPhone;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}