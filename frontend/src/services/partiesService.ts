import { api } from "./api";

export async function getParties() {
	const res = await api.get("/parties");
	return res.data;
}

export async function createParty(data: any) {
	const res = await api.post("/parties", data);
	return res.data;
}