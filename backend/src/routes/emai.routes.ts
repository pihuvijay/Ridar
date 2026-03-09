// src/routes/email.routes.ts
import { Router } from "express";
import { z } from "zod";
import { mailer } from "../lib/mailer";
import { env } from "../config/env";

export const emailRouter = Router();

// In-memory store: email -> { code, expiresAt }
const codes = new Map<string, { code: string; expiresAt: number }>();

function make6DigitCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

emailRouter.post("/send-code", async (req, res) => {
  const Body = z.object({ email: z.string().email() });
  const parsed = Body.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: { message: "Invalid email" } });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const code = make6DigitCode();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  codes.set(email, { code, expiresAt });

  await mailer.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: "Your Ridar verification code",
    text: `Your Ridar verification code is: ${code}\n\nThis code expires in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5">
        <h2>Ridar verification code</h2>
        <p>Your code is:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 2px; margin: 12px 0">${code}</div>
        <p>This code expires in <b>10 minutes</b>.</p>
      </div>
    `,
  });

  // For demo, we do NOT return the code in response.
  return res.json({ ok: true, data: { sent: true } });
});

emailRouter.post("/verify-code", (req, res) => {
  const Body = z.object({
    email: z.string().email(),
    code: z.string().min(4).max(10),
  });
  const parsed = Body.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: { message: "Invalid input" } });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const code = parsed.data.code.trim();

  const record = codes.get(email);
  if (!record) {
    return res.status(400).json({ ok: false, error: { message: "No code requested for this email" } });
  }

  if (Date.now() > record.expiresAt) {
    codes.delete(email);
    return res.status(400).json({ ok: false, error: { message: "Code expired" } });
  }

  if (record.code !== code) {
    return res.status(400).json({ ok: false, error: { message: "Invalid code" } });
  }

  // success - consume code
  codes.delete(email);
  return res.json({ ok: true, data: { verified: true } });
});