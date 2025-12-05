export class Sites {
    constructor({
                    id = null, name = '',  address = '', contactName = '',
                    phone = '', created = '', updated = ''
                }) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.contactName = contactName;
        this.phone = phone;
        this.created = created;
        this.updated = updated;
    }
}