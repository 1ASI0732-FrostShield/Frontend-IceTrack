export class Equipment {
    constructor({id = null, tenantId = '', siteId = '', name = '', type = '',
                    manufacturer = '',  model = '',  serial = '',  installedAt = '',
                    status = '',  powerState = '',  setpointC = null,  lastSeenAt = '',
                    online = false, createdAt = '', updatedAt = ''
                    }) {
        this.id = id;
        this.tenantId = tenantId;
        this.siteId = siteId;
        this.name = name;
        this.type = type;
        this.manufacturer = manufacturer;
        this.model = model;
        this.serial = serial;
        this.installedAt = installedAt;
        this.status = status;
        this.powerState = powerState;
        this.setpointC = setpointC;
        this.lastSeenAt = lastSeenAt;
        this.online = online;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
