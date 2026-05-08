export class Equipments {
    /**
     * Creates a new Equipment instance.
     */
    constructor({
                    id = null, equipmentId = null, model = '', type = '', serial = '',
                    status = '',  setPoint = 0, name = '',  siteId = 0,
                    manufacturer = '', online = false, created = '', updated = ''
                }) {
        this.id = id;
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

