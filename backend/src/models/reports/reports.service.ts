import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import * as c from "../chat/chat.controller";
import { ChatEchoSchema } from "../chat/chat.schemas";

export const chatRouter = Router();
chatRouter.post("/echo", requireAuth, validateBody(ChatEchoSchema), c.echo);

export function status() {
    throw new Error("Function not implemented.");
}
