import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import * as c from "./wallet.controller";

export const walletRouter = Router();
walletRouter.get("/balance", requireAuth, c.balance);