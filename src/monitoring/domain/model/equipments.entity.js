export class Equipments {
    /**
     * Creates a new Equipment instance.
     */
    constructor({
                    id = null, equipmentId = null, model = '', type = '', serial = '',
                    status = '', installed = '', lastSeen = '',  setPoint = 0,
                    name = '',  manufacturer = '', online = false,
                    created = '', updated = ''
                }) {
        this.id = id;
        this.equipmentId = equipmentId;
        this.model = model;
        this.type = type;
        this.serial = serial;
        this.status = status;
        this.installed = installed;
        this.lastSeen = lastSeen;
        this.setPoint = setPoint;
        this.name = name;
        this.manufacturer = manufacturer;
        this.online = online;
        this.created = created;
        this.updated = updated;
    }
}

