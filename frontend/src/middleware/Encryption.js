import CryptoJS from "crypto-js";

const key = import.meta.env.VITE_ENCRYPTION_KEYS; // 32-byte hex string
const iv = import.meta.env.VITE_ENCRYPTION_IV;    // 16-byte hex string

const ENCRYPTION_KEYS = CryptoJS.enc.Hex.parse(key);
const IVS = CryptoJS.enc.Hex.parse(iv);

// Helper: check if a string is valid hex
function isHex(str) {
  return /^[0-9a-fA-F]+$/.test(str);
}

function encrypt(input) {
  const encrypted = CryptoJS.AES.encrypt(input, ENCRYPTION_KEYS, {
    iv: IVS,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
}

function decrypt(input) {
  try {
    if (!input || typeof input !== "string" || !isHex(input)) {
      return null; // Skip decryption if input is empty, not a string, or not hex
    }

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: CryptoJS.enc.Hex.parse(input) },
      ENCRYPTION_KEYS,
      {
        iv: IVS,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    const result = decrypted.toString(CryptoJS.enc.Utf8);
    return result || null; // Return null if decryption yields empty string
  } catch (error) {
    return null; // Return null on any decryption error
  }
}

export { encrypt, decrypt };
