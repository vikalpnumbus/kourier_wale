import crypto from "crypto";
import {
  ENCRYPTION_IV,
  ENCRYPTION_KEY,
} from "../configurations/base.config.mjs";
const ENCRYPTION_KEYS = Buffer.from(ENCRYPTION_KEY, "hex"); // 32 bytes
const IVS = Buffer.from(ENCRYPTION_IV, "hex"); // 16 bytes

// Encrypt
function encrypt(input) {
  const text = input.toString();
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEYS, IVS);
  let encrypted = cipher.update(text.toString(), "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

// Decrypt
function decrypt(input) {
  const encryptedText = input.toString();
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEYS, IVS);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
export { encrypt, decrypt };
