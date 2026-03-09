import { Router } from "express";
import { supabaseAdmin } from "../../lib/supabase";

export const authDevRouter = Router();

// DEV ONLY: reset a user's password by email
authDevRouter.post("/reset-password", async (req, res, next) => {
  try {
    const { email, newPassword } = req.body as {
      email: string;
      newPassword: string;
    };

    if (!email || !newPassword || newPassword.length < 8) {
      return res.status(400).json({
        ok: false,
        error: { message: "email and newPassword (min 8 chars) are required" },
      });
    }

    const admin = supabaseAdmin();

    // Find user by email
    const { data: listData, error: listErr } =
      await admin.auth.admin.listUsers();

    if (listErr) throw Object.assign(new Error(listErr.message), { status: 400 });

    const user = listData?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );

    if (!user) {
      return res.status(404).json({
        ok: false,
        error: { message: "User not found" },
      });
    }

    // Update password
    const { data, error } = await admin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (error) throw Object.assign(new Error(error.message), { status: 400 });

    res.json({ ok: true, data: { userId: data.user.id } });
  } catch (e) {
    next(e);
  }
});