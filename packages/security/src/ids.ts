import { customAlphabet } from "nanoid";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const createReferralCode = customAlphabet(alphabet, 8);
export const createTradeRequestId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 21);
