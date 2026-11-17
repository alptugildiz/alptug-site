// Prints a password hash for GIDER_ALPTUG_PASSWORD_HASH / GIDER_GAMZE_PASSWORD_HASH.
// Usage: node scripts/gider-hash.mjs '<password>'
// Same parameters as hashPassword() in src/lib/giderler/auth.ts — keep them in sync.
import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error("usage: node scripts/gider-hash.mjs '<password>'");
  process.exit(1);
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64);
console.log(`scrypt$${salt.toString("hex")}$${hash.toString("hex")}`);
