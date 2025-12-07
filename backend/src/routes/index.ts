// API route definitions and endpoint mappings for Express router
import { Router } from "express";
import axios from "axios";

const router = Router();

// Example route
router.get("/", (req, res) => {
  res.send("API is working");
});

router.get("/geocode", async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: "Address query parameter is required" });
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address,
          key: process.env.GOOGLE_MAPS_API_KEY,

        },
      }
    );

    const results = response.data.results;
    if (results.length === 0) {
      return res.status(404).json({ error: "No results found" });
    }

    res.json(results[0].geometry.location);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch data from Maps API" });
  }
});

export default router;
