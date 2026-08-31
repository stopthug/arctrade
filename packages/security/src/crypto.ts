import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;

export function parseEncryptionKey(hexKey: string): Buffer {
  const trimmed = hexKey.trim();
  if (!/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    throw new Error("ENCRYPTION_KEY must be 32 bytes as 64 hex characters.");
  }
  return Buffer.from(trimmed, "hex");
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
  keyVersion: number;
}

export function encryptSecret(
  plaintext: string,
  key: Buffer,
  aad: string,
  keyVersion = 1,
): EncryptedPayload {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, key, iv);
  cipher.setAAD(Buffer.from(aad, "utf8"));
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    keyVersion,
  };
}

export function decryptSecret(payload: EncryptedPayload, key: Buffer, aad: string): string {
  const decipher = createDecipheriv(ALGO, key, Buffer.from(payload.iv, "base64"));
  decipher.setAAD(Buffer.from(aad, "utf8"));
  decipher.setAuthTag(Buffer.from(payload.authTag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
