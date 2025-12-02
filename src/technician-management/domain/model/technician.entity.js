export class Technician {
    constructor({ id, name, specialty, phone, providerId, averageRating = 0 }) {
        this.id = id;
        this.name = name;
        this.specialty = specialty;
        this.phone = phone;
        this.providerId = providerId;
        this.averageRating = averageRating;
    }
}
