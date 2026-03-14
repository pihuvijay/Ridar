import { Router } from "express";
import * as c from "./reports.controller";

export const reportsRouter = Router();
reportsRouter.get("/status", c.status);