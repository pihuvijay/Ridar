import { Request, Response, NextFunction } from "express";
import { uberService } from "./uber.service";
import { ok } from "../../utils/http";

export const uberController = {
    getPriceEstimates: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { start_lat, start_lng, end_lat, end_lng } = req.query as Record<string, string>;

            const estimates = await uberService.getPriceEstimates(
                { lat: parseFloat(start_lat), lng: parseFloat(start_lng) },
                { lat: parseFloat(end_lat), lng: parseFloat(end_lng) }
            );

            res.json(ok(estimates));
        } catch (err) {
            next(err);
        }
    },

    requestRide: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { productId, startLat, startLng, endLat, endLng } = req.body;

            const ride = await uberService.requestRide({
                productId,
                start: { lat: startLat, lng: startLng },
                end: { lat: endLat, lng: endLng },
            });

            res.status(201).json(ok(ride));
        } catch (err) {
            next(err);
        }
    },

    getRideStatus: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { rideId } = req.params;
            const ride = await uberService.getRideStatus(rideId);
            res.json(ok(ride));
        } catch (err) {
            next(err);
        }
    },

    cancelRide: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { rideId } = req.params;
            const result = await uberService.cancelRide(rideId);
            res.json(ok(result));
        } catch (err) {
            next(err);
        }
    },
};
