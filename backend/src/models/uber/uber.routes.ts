import { Router } from 'express';
import { uberController } from './uber.controller';
import { protect } from '../../middleware/auth';

export const uberRidesRouter = Router();

// Protect not used during development while modules are tested


uberRidesRouter.get(
    "/estimates",
    /* protect, */
    uberController.getPriceEstimates
);

uberRidesRouter.post(
    "/request",
    /* protect, */
    uberController.requestRide
);


uberRidesRouter.get(
    "/ride/:rideId",
    /* protect, */
    uberController.getRideStatus
);


uberRidesRouter.delete(
    "/ride/:rideId",
    /* protect, */
    uberController.cancelRide
);
