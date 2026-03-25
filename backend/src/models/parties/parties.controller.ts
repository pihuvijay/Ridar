import type { Response, NextFunction, Request } from "express";
import { partiesService } from "./parties.service";

interface AuthedRequest extends Request {
	user?: { id: string };
}

export async function list(
	req: AuthedRequest,
	res: Response,
	next: NextFunction,
) {
	try {
		const userId = req.user!.id;
		const data = await partiesService.listParties(userId);
		res.json({ ok: true, data });
	} catch (e) {
		next(e);
	}
}

export async function create(
	req: AuthedRequest,
	res: Response,
	next: NextFunction,
) {
	try {
		const userId = req.user!.id;
		const {
			name,
			maxMembers,
			pickup,
			destination,
			leaveBy,
			pricePerPerson,
		} = req.body;

		console.log("CONTROLLER pricePerPerson:", pricePerPerson);
		console.log("CONTROLLER body:", JSON.stringify(req.body, null, 2));

		const data = await partiesService.createParty(userId, {
			name,
			maxMembers,
			pickup,
			destination,
			leaveBy,
			pricePerPerson,
		});

		res.status(201).json({ ok: true, data });
	} catch (e) {
		next(e);
	}
}

export async function getParty(
	req: AuthedRequest,
	res: Response,
	next: NextFunction,
) {
	try {
		const { partyId } = req.params;
		const data = await partiesService.getParty(partyId);

		if (!data) {
			return res
				.status(404)
				.json({ ok: false, error: { message: "Party not found" } });
		}

		res.json({ ok: true, data });
	} catch (e) {
		next(e);
	}
}

export async function updateLocations(
	req: AuthedRequest,
	res: Response,
	next: NextFunction,
) {
	try {
		const { partyId } = req.params;
		const { pickup, destination } = req.body;

		if (!pickup && !destination) {
			return res.status(400).json({
				ok: false,
				error: { message: "pickup or destination required" },
			});
		}

		const data = await partiesService.updatePartyLocations(partyId, {
			pickup,
			destination,
		});

		res.json({ ok: true, data });
	} catch (e: any) {
		if (e instanceof Error && e.message === "Party not found") {
			return res.status(404).json({
				ok: false,
				error: { message: "Party not found" },
			});
		}
		next(e);
	}
}

export async function join(
	req: AuthedRequest,
	res: Response,
	next: NextFunction,
) {
	try {
		const userId = req.body.userId ?? req.user!.id;
		const { partyId } = req.params;
		const { dropoff, status } = req.body;

		console.log("[PARTY JOIN REQUEST]", {
			partyId,
			userId,
			dropoff,
			status,
			timestamp: new Date().toISOString(),
		});

		const data = await partiesService.joinParty(partyId, userId, {
			dropoff,
			status,
		});

		res.status(201).json({ ok: true, data });
	} catch (e: any) {
		if (e instanceof Error && e.message === "Party not found") {
			return res.status(404).json({
				ok: false,
				error: { message: "Party not found" },
			});
		}
		next(e);
	}
}

export async function leave(
	req: AuthedRequest,
	res: Response,
	next: NextFunction,
) {
	try {
		const userId = req.user!.id;
		const { partyId } = req.params;

		const data = await partiesService.leaveParty(partyId, userId);

		res.json({ ok: true, data });
	} catch (e: any) {
		if (e instanceof Error && e.message === "Party not found") {
			return res.status(404).json({
				ok: false,
				error: { message: "Party not found" },
			});
		}

		if (e instanceof Error && e.message === "Leader cannot leave party") {
			return res.status(400).json({
				ok: false,
				error: { message: "Leader cannot leave party" },
			});
		}

		next(e);
	}
}

export async function cancel(
	req: AuthedRequest,
	res: Response,
	next: NextFunction,
) {
	try {
		const userId = req.user!.id;
		const { partyId } = req.params;

		const data = await partiesService.cancelParty(partyId, userId);

		res.json({ ok: true, data });
	} catch (e: any) {
		if (e instanceof Error && e.message === "Party not found") {
			return res.status(404).json({
				ok: false,
				error: { message: "Party not found" },
			});
		}

		if (e instanceof Error && e.message === "Only leader can cancel party") {
			return res.status(403).json({
				ok: false,
				error: { message: "Only leader can cancel party" },
			});
		}

		next(e);
	}
}