// Configuration files for database, environment variables, and app settings
import express from "express";
import routes from "../routes"; // adjust if needed

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Register routes (if your routes folder exports a router)
app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
