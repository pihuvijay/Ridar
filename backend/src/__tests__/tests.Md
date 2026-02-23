## running tests

bash ' 
cd backend
npm test '

## parties tests

1	Create party (success)	

POST /parties with name, maxMembers, pickup, destination, userId	201, JSON, ok: true, data has id, leaderUserId, name, maxMembers, pickup, destination, status: "open", currentMembers

2	Create party (invalid body)	

POST /parties with only { name: "Only name" }	400, JSON, ok: false, error present

3	Create party (invalid pickup)	

POST /parties with pickup: { lat: 51.5 } (no lng or label)	400

4	Get party (exists)	

Create a party, then GET /parties/:partyId with that id	200, ok: true, data.id matches, data.pickup and data.destination match what was created

5	Get party (not found)	

GET /parties/nonexistent-id-12345	404, ok: false, error.message matches “not found” (case‑insensitive)

6	Update locations (success)	

Create party, then PATCH /parties/:partyId/locations with { pickup: { lat, lng, label } }	200, ok: true, data.pickup is the new pickup, data.destination unchanged

7	Update locations (empty body)	

Create party, then PATCH /parties/:partyId/locations with {}	400 (at least one of pickup or destination required)

8	Join party (stub)	

Create party, then POST /parties/:partyId/join