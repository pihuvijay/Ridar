import request from "supertest";
import { createApp } from "../app";

const app = createApp();

const validPartyBody = {
  name: "Campus to Downtown",
  maxMembers: 4,
  pickup: { lat: 51.501, lng: -0.141, label: "Campus" },
  destination: { lat: 51.515, lng: -0.09, label: "Downtown" },
  userId: "test-leader-123",
};

describe("Parties API", () => {
  describe("POST /parties", () => {
    it("returns 201 and creates a party with pickup and destination", async () => {
      const res = await request(app)
        .post("/parties")
        .send(validPartyBody)
        .expect("Content-Type", /json/)
        .expect(201);

      expect(res.body).toHaveProperty("ok", true);
      expect(res.body.data).toMatchObject({
        name: validPartyBody.name,
        maxMembers: validPartyBody.maxMembers,
        pickup: validPartyBody.pickup,
        destination: validPartyBody.destination,
        status: "open",
      });
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data).toHaveProperty("leaderUserId", validPartyBody.userId);
      expect(res.body.data).toHaveProperty("currentMembers");
    });

    it("returns 400 when body is invalid (missing required fields)", async () => {
      const res = await request(app)
        .post("/parties")
        .send({ name: "Only name" })
        .expect("Content-Type", /json/)
        .expect(400);

      expect(res.body.ok).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    it("returns 400 when pickup or destination has invalid shape", async () => {
      await request(app)
        .post("/parties")
        .send({
          ...validPartyBody,
          pickup: { lat: 51.5 }, // missing lng and label
        })
        .expect(400);
    });
  });

  describe("GET /parties/:partyId", () => {
    it("returns 200 and party when it exists", async () => {
      const create = await request(app).post("/parties").send(validPartyBody).expect(201);
      const partyId = create.body.data.id;

      const res = await request(app).get(`/parties/${partyId}`).expect(200);

      expect(res.body.ok).toBe(true);
      expect(res.body.data.id).toBe(partyId);
      expect(res.body.data.pickup).toEqual(validPartyBody.pickup);
      expect(res.body.data.destination).toEqual(validPartyBody.destination);
    });

    it("returns 404 when party does not exist", async () => {
      const res = await request(app).get("/parties/nonexistent-id-12345").expect(404);

      expect(res.body.ok).toBe(false);
      expect(res.body.error?.message).toMatch(/not found/i);
    });
  });

  describe("PATCH /parties/:partyId/locations", () => {
    it("returns 200 and updates pickup/destination", async () => {
      const create = await request(app).post("/parties").send(validPartyBody).expect(201);
      const partyId = create.body.data.id;

      const newPickup = { lat: 51.502, lng: -0.14, label: "New Campus Gate" };
      const res = await request(app)
        .patch(`/parties/${partyId}/locations`)
        .send({ pickup: newPickup })
        .expect(200);

      expect(res.body.ok).toBe(true);
      expect(res.body.data.pickup).toEqual(newPickup);
      expect(res.body.data.destination).toEqual(validPartyBody.destination);
    });

    it("returns 400 when body has neither pickup nor destination", async () => {
      const create = await request(app).post("/parties").send(validPartyBody).expect(201);
      const partyId = create.body.data.id;

      await request(app).patch(`/parties/${partyId}/locations`).send({}).expect(400);
    });
  });

  describe("POST /parties/:partyId/join", () => {
    it("allows a user to join and returns 201 with ride info", async () => {
      const create = await request(app).post("/parties").send(validPartyBody).expect(201);
      const partyId = create.body.data.id;

      const res = await request(app)
        .post(`/parties/${partyId}/join`)
        .send({ userId: "rider-111" })
        .expect(201);

      expect(res.body.ok).toBe(true);
      expect(res.body.data).toMatchObject({
        rideId: partyId,
        userId: "rider-111",
        status: "pending",
      });

      // fetch the ride to verify currentMembers incremented
      const after = await request(app).get(`/parties/${partyId}`).expect(200);
      expect(after.body.data.currentMembers).toBe(2);
    });

    it("accepts dropoff details and status in the body", async () => {
      const create = await request(app).post("/parties").send(validPartyBody).expect(201);
      const partyId = create.body.data.id;
      const dropoff = { lat: 51.503, lng: -0.13, label: "Museum" };

      const res = await request(app)
        .post(`/parties/${partyId}/join`)
        .send({ userId: "rider-222", dropoff, status: "joined" })
        .expect(201);

      expect(res.body.ok).toBe(true);
      expect(res.body.data).toMatchObject({
        rideId: partyId,
        userId: "rider-222",
        status: "joined",
        dropoff,
      });
    });
  });
});
