/**
 * @class Intervention
 * @description Represents an intervention performed as part of a service request.
 * @author Kenyi Ramirez
 */
export class Intervention {
    /**
     * @constructor
     * @param {object} props - The properties of the intervention.
     */
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
