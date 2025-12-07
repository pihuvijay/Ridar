// Configuration files for database, environment variables, and app settings
import express from "express";
import dotenv from "dotenv";
import routes from "../routes/index";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
