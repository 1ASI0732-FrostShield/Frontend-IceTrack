export class Sites {

    constructor({
                    id = null, ownerId = null, name = '',  address = '', cantEquipment = null, contactName = '',
                    phone = '', created = '', updated = ''
                }) {
        this.id = id;
        this.ownerId = ownerId;
        this.name = name;
        this.address = address;
        this.cantEquipment = cantEquipment;
        this.contactName = contactName;
        this.phone = phone;
        this.created = created;
        this.updated = updated;
    }

}
