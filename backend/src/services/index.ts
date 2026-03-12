// Business logic, data processing, and interactions with external services
import nodemailer from 'nodemailer';

interface User {
  fullName: string;
  email: string;
  password: string;
  courseMajor: string;
  age: number;
  gender: string;
}

const users = new Map<string, User>();
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();
const verifiedEmails = new Set<string>();

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export const authService = {
  signIn(email: string, password: string) {
    const normalizedEmail = normalizeEmail(email);
    const user = users.get(normalizedEmail);
    if (!user || user.password !== password) {
      return { success: false, message: 'Invalid email or password' };
    }
    return {
      success: true,
      message: 'Sign in successful',
      token: `token-${normalizedEmail}`,
      user: { id: normalizedEmail, email: user.email, fullName: user.fullName },
    };
  },

  signUp(data: User) {
    const normalizedEmail = normalizeEmail(data.email);
    if (users.has(normalizedEmail)) {
      return { success: false, message: 'Email is already registered' };
    }
    if (!verifiedEmails.has(normalizedEmail)) {
      return { success: false, message: 'Please verify your email before signing up' };
    }
    users.set(normalizedEmail, { ...data, email: normalizedEmail });
    return {
      success: true,
      message: 'Account created successfully',
      token: `token-${normalizedEmail}`,
      user: { id: normalizedEmail, email: normalizedEmail, fullName: data.fullName },
    };
  },

  verifyEmail(email: string) {
    const normalizedEmail = normalizeEmail(email);
    const endsWithAcademicDomain = normalizedEmail.endsWith('.ac.uk');
    const alreadyRegistered = users.has(normalizedEmail);
    const isValid = endsWithAcademicDomain && !alreadyRegistered;
    return {
      success: true,
      message: isValid
        ? 'Email is eligible for verification'
        : 'Email must be a .ac.uk address and not already registered',
      isValid,
    };
  },

  async sendVerificationCode(email: string) {
    const normalizedEmail = normalizeEmail(email);
    const verification = this.verifyEmail(normalizedEmail);
    if (!verification.isValid) {
      return { success: false, message: verification.message };
    }

    const code = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    verificationCodes.set(normalizedEmail, { code, expiresAt });

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.warn('[Ridar] WARNING: GMAIL_USER or GMAIL_APP_PASSWORD not set in .env — logging code instead.');
      console.log(`[Ridar] Verification code for ${normalizedEmail}: ${code}`);
      return { success: true, message: 'Verification code sent to your email' };
    }

    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"Ridar" <${process.env.GMAIL_USER}>`,
        to: normalizedEmail,
        subject: 'Ridar - Your Verification Code',
        text: `Your Ridar verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
        html: `
          <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #1a6b3a;">Ridar Email Verification</h2>
            <p style="color: #374151;">Your verification code is:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a6b3a; padding: 16px; background: #f3f4f6; border-radius: 8px; text-align: center;">
              ${code}
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">
              This code expires in 10 minutes. If you did not request this, please ignore this email.
            </p>
          </div>
        `,
      });
      console.log(`[Ridar] Verification email sent to ${normalizedEmail}`);
      return { success: true, message: 'Verification code sent to your email' };
    } catch (err: any) {
      console.error('[Ridar] Failed to send email:', err.message);
      return { success: false, message: 'Failed to send verification email. Please try again.' };
    }
  },

  verifyEmailCode(email: string, code: string) {
    const normalizedEmail = normalizeEmail(email);
    const record = verificationCodes.get(normalizedEmail);
    if (!record) {
      return { success: false, message: 'No verification code found. Please request a new code', isValid: false };
    }
    if (Date.now() > record.expiresAt) {
      verificationCodes.delete(normalizedEmail);
      return { success: false, message: 'Verification code has expired. Please request a new one', isValid: false };
    }
    if (record.code !== code.trim()) {
      return { success: false, message: 'Invalid verification code', isValid: false };
    }
    verificationCodes.delete(normalizedEmail);
    verifiedEmails.add(normalizedEmail);
    return { success: true, message: 'Email verified successfully', isValid: true };
  },
};
