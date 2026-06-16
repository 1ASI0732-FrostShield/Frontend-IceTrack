export class Equipments {
    constructor({
                    id = null, ownerId = null, equipmentId = null, model = '', type = '',
                    serial = '', status = '', name = '',  siteId = 0,
                    online = false, created = '', updated = ''
                }) {
        this.id = id;
        this.ownerId = ownerId;
        this.equipmentId = equipmentId;
        this.model = model;
        this.type = type;
        this.serial = serial;
        this.status = status;
        this.name = name;
        this.siteId = siteId;
        this.online = online;
        this.created = created;
        this.updated = updated;
    }
}

