# Parties API Documentation

## Overview

This API allows frontend applications to manage ride parties.

Base URL (local development):

    http://localhost:3000

All responses follow the format:

``` json
{
  "ok": true,
  "data": {}
}
```

The names section seems to have some issues. Fields may need to be added in the user_rides table and rides table for names.

make sure MOCK_PARTIES=false is set in the env when testing with database
------------------------------------------------------------------------

## Create a Party

**Endpoint**

    POST /parties

### Description

Creates a new ride/party.\
Until authentication is added, `userId` can be supplied in the request
body.

### Request Body

``` json
{
  "name": "Test Ride",
  "maxMembers": 4,
  "pickup": { "lat": 51.501, "lng": -0.141, "label": "Kings Cross" },
  "destination": { "lat": 51.515, "lng": -0.09, "label": "Piccadilly" },
  "leaveBy": "2026-03-02T15:00:00Z",
  "userId": "00000000-0000-0000-0000-000000000000"
}
```

### Field Descriptions

| Field | Type | Required | Description |
|------|------|----------|-------------|
| name | string | ✅ | Name of the ride |
| maxMembers | number | ✅ | Maximum riders (min 2) |
| pickup | object | ✅ | Pickup location |
| pickup.lat | number | ✅ | Latitude |
| pickup.lng | number | ✅ | Longitude |
| pickup.label | string | ✅ | Display label |
| destination | object | ✅ | Destination location |
| destination.lat | number | ✅ | Latitude |
| destination.lng | number | ✅ | Longitude |
| destination.label | string | ✅ | Display label |
| leaveBy | string (ISO datetime) | ❌ | Optional departure time |
| userId | string | ❌ | Testing fallback until auth exists |


(To be updated)

### Example Response

``` json
{
  "ok": true,
  "data": {
    "id": "99ca6828-342f-451d-95bc-a8c6522609d6",
    "leaderUserId": "00000000-0000-0000-0000-000000000000",
    "name": "Test Ride",
    "maxMembers": 4,
    "currentMembers": 0,
    "pickup": { "lat": 51.501, "lng": -0.141, "label": "Kings Cross" },
    "pickupGeog": "0101000020E61000003F355EBA490CC2BFE3A59BC420C04940",
    "destination": { "lat": 51.515, "lng": -0.09, "label": "Piccadilly" },
    "destinationGeog": "0101000020E61000000AD7A3703D0AB7BF52B81E85EBC14940",
    "leaveBy": "2026-03-02T15:00:00",
    "status": "pending"
  }
}
```

**Notes** - `pickupGeog` and `destinationGeog` are WKT geospatial values
used internally. - `status` values may include: `pending`, `open`,
`full`, `closed`, `completed`.

------------------------------------------------------------------------

## Get Party

**Endpoint**

    GET /parties/:partyId

### Path Parameters

  Param     Type     Description
  --------- -------- -------------
  partyId   string   Party UUID

### Example Response

``` json
{
  "ok": true,
  "data": {
    "id": "99ca6828-342f-451d-95bc-a8c6522609d6",
    "leaderUserId": "00000000-0000-0000-0000-000000000000",
    "name": "Test Ride",
    "maxMembers": 4,
    "currentMembers": 1,
    "pickup": { "lat": 51.501, "lng": -0.141, "label": "Kings Cross" },
    "destination": { "lat": 51.515, "lng": -0.09, "label": "Piccadilly" },
    "leaveBy": "2026-03-02T15:00:00",
    "status": "open"
  }
}
```

------------------------------------------------------------------------

## Update Party Locations

**Endpoint**

    PATCH /parties/:partyId/locations

### Request Body

At least one of `pickup` or `destination` must be supplied.

``` json
{
  "pickup": { "lat": 51.502, "lng": -0.142, "label": "Euston" }
}
```

### Response

Returns the updated party object.

------------------------------------------------------------------------

## Join a Party

**Endpoint**

    POST /parties/:partyId/join

### Request Body

``` json
{
  "userId": "00000000-0000-0000-0000-000000000000",
  "dropoff": { "lat": 51.518, "lng": -0.085, "label": "Soho" },
  "status": "pending"
}
```

### Example Response

``` json
{
  "ok": true,
  "data": {
    "rideId": "99ca6828-342f-451d-95bc-a8c6522609d6",
    "userId": "00000000-0000-0000-0000-000000000000",
    "dropoff": { "lat": 51.518, "lng": -0.085, "label": "Soho" },
    "status": "pending"
  }
}
```

------------------------------------------------------------------------

## Notes for Frontend Developers

-   All endpoints return `{ ok: boolean, data?: any, error?: any }`.
-   Authentication will later replace `userId` in the request body.
-   Location objects always follow:

```{=html}
<!-- -->
```
    { lat: number, lng: number, label: string }

-   ISO timestamps should be used for all date/time values.

------------------------------------------------------------------------

## Local Testing Example (PowerShell)

``` powershell
$body = @{
    name        = "Test Ride"
    maxMembers  = 4
    pickup      = @{ lat = 51.501; lng = -0.141; label = "Kings Cross" }
    destination = @{ lat = 51.515; lng = -0.09;  label = "Piccadilly" }
    userId      = "00000000-0000-0000-0000-000000000000"
    leaveBy     = "2026-03-02T15:00:00Z"
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri "http://localhost:3000/parties" `
    -Method POST `
    -Headers @{ "Content-Type" = "application/json" } `
    -Body $body
```
