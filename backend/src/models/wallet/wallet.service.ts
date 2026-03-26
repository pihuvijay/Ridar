import type { WalletBalance } from "./wallet.types";

export async function getBalance(_userId: string): Promise<WalletBalance> {
  // later: compute from DB + Stripe
  return { balance: 0, currency: "USD" };
}