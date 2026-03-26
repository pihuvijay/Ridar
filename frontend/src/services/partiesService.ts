import { partiesService } from "./api";

export async function getParties() {
	const res = await partiesService.list();
	if (!res.success) throw new Error(res.message);
	return res.data;
}

export async function createParty(data: any) {
	const res = await partiesService.create(data);
	if (!res.success) throw new Error(res.message);
	return res.data;
}