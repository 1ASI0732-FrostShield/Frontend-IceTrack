export class Review {
    constructor({ id, serviceRequestId, ownerId, technicianId, comunicacion, eficiencia, profesionalidad, average, comment, createdAt }) {
        this.id = id;
        this.serviceRequestId = serviceRequestId;
        this.ownerId = ownerId;
        this.technicianId = technicianId;
        this.comunicacion = comunicacion;
        this.eficiencia = eficiencia;
        this.profesionalidad = profesionalidad;
        this.average = average;
        this.comment = comment;
        this.createdAt = createdAt;
    }
}
