export class Intervention {
    constructor({ id, serviceRequestId, technicianId, status, summary, startTime, endTime, photoUrls = [] }) {
        this.id = id;
        this.serviceRequestId = serviceRequestId;
        this.technicianId = technicianId;
        this.status = status;
        this.summary = summary;
        this.startTime = startTime;
        this.endTime = endTime;
        this.photoUrls = photoUrls;
    }
}
