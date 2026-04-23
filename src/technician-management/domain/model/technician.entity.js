/**
 * @class Technician
 * @description Represents a technician entity.
 * @author Kenyi Ramirez
 */
export class Technician {
    /**
     * @constructor
     * @param {object} props - The properties of the technician.
     * @param {number} props.id - The technician's ID.
     * @param {string} props.name - The technician's name.
     * @param {string} props.specialty - The technician's specialty.
     * @param {string} props.phone - The technician's phone number.
     * @param {number} props.providerId - The ID of the provider associated with the technician.
     * @param {number} [props.averageRating=0] - The technician's average rating.
     */
    constructor({ id, name, specialty, phone, providerId, averageRating = 0 }) {
        this.id = id;
        this.name = name;
        this.specialty = specialty;
        this.phone = phone;
        this.providerId = providerId;
        this.averageRating = averageRating;
    }
}
