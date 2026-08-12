import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const VERSION = 1;

export type CapsuleExportPayload = {
  capsules: Array<{
    authorName: string | null;
    category?: string;
    bodyHtml: string;
    createdAt: string;
  }>;
};

export type EncryptedCapsuleFile = {
  version: number;
  exportedAt: string;
  salt: string;
  iv: string;
  ciphertext: string;
};

function getExportKeyMaterial() {
  const key = process.env.CAPSULE_EXPORT_KEY;
  if (!key || key.length < 8) {
    throw new Error("CAPSULE_EXPORT_KEY must be set");
  }
  return key;
}

function deriveKey(passphrase: string, salt: Buffer) {
  return scryptSync(passphrase, salt, 32);
}

export function encryptCapsules(payload: CapsuleExportPayload): EncryptedCapsuleFile {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = deriveKey(getExportKeyMaterial(), salt);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    version: VERSION,
    exportedAt: new Date().toISOString(),
    salt: salt.toString("base64"),
    iv: iv.toString("base64"),
    ciphertext: Buffer.concat([encrypted, tag]).toString("base64"),
  };
}

export function decryptCapsules(file: EncryptedCapsuleFile): CapsuleExportPayload {
  if (file.version !== VERSION) {
    throw new Error("Unsupported export file version");
  }

  const salt = Buffer.from(file.salt, "base64");
  const iv = Buffer.from(file.iv, "base64");
  const data = Buffer.from(file.ciphertext, "base64");
  if (data.length < 17) {
    throw new Error("Invalid ciphertext");
  }

  const encrypted = data.subarray(0, data.length - 16);
  const tag = data.subarray(data.length - 16);
  const key = deriveKey(getExportKeyMaterial(), salt);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8")) as CapsuleExportPayload;
}
