import { Router } from 'express';
import { uberController } from './uber.controller';
import { protect } from '../../middleware/auth';

export const uberRidesRouter = Router();

/**
 * GET /uber/estimates?start_lat=&start_lng=&end_lat=&end_lng=
 * Returns price estimates from Uber sandbox (real API call)
 */
uberRidesRouter.get(
    "/estimates",
    /* protect, */
    uberController.getPriceEstimates
);

/**
 * POST /uber/request
 * Request a ride (mocked — real API requires restricted scopes)
 */
uberRidesRouter.post(
    "/request",
    /* protect, */
    uberController.requestRide
);

/**
 * GET /uber/ride/:rideId
 * Get ride status (mocked, auto-progresses over time)
 */
uberRidesRouter.get(
    "/ride/:rideId",
    /* protect, */
    uberController.getRideStatus
);

/**
 * DELETE /uber/ride/:rideId
 * Cancel a ride (mocked)
 */
uberRidesRouter.delete(
    "/ride/:rideId",
    /* protect, */
    uberController.cancelRide
);
