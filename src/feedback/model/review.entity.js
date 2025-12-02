export class Review {
    constructor({ id, serviceRequestId, ownerId, technicianId, rating, comment, createdAt }) {
        this.id = id;
        this.serviceRequestId = serviceRequestId;
        this.ownerId = ownerId;
        this.technicianId = technicianId;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }
}
