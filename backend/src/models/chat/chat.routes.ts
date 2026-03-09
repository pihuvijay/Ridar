import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import * as c from "./chat.controller";
import { ChatEchoSchema } from "./chat.schemas";

export const chatRouter = Router();
chatRouter.post("/echo", requireAuth, validateBody(ChatEchoSchema), c.echo);