import { BaseApi } from "@/shared/infrastructure/base-api.js";

const reviewsEndpointPath = '/reviews';

export class ReviewsApi extends BaseApi {
    constructor() {
        super();
    }

    createReview(reviewData) {
        return this.http.post(reviewsEndpointPath, reviewData);
    }

    getReviewById(reviewId) {
        return this.http.get(`${reviewsEndpointPath}/${reviewId}`);
    }

    getReviewsByServiceRequest(serviceRequestId) {
        return this.http.get(reviewsEndpointPath, { params: { serviceRequestId } });
    }

    getAllReviews() {
        return this.http.get(reviewsEndpointPath);
    }
}
