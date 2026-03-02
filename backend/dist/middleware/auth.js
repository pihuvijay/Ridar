"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const supabase_1 = require("../lib/supabase");
const protect = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const { data: { user }, error } = await supabase_1.supabaseAdmin.auth.getUser(token);
    if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    // Attach user to request for use in controllers
    req.user = user;
    next();
};
exports.protect = protect;
