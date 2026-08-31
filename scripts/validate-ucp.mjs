import { readFileSync } from "node:fs";

const path = ".well-known/ucp";
const manifest = JSON.parse(readFileSync(path, "utf8"));

const required = [
  ["$schema", "string"],
  ["protocol_version", "string"],
  ["merchant", "object"],
  ["services", "object"],
  ["capabilities", "object"],
];

for (const [key, type] of required) {
  if (!(key in manifest) || typeof manifest[key] !== type) {
    throw new Error(`UCP manifest missing/invalid field: ${key}`);
  }
}

for (const key of ["gaming", "shopping", "identity", "education"]) {
  if (typeof manifest.services[key] !== "string") {
    throw new Error(`UCP manifest missing service: ${key}`);
  }
}

if (!Array.isArray(manifest.capabilities) || manifest.capabilities.length === 0) {
  throw new Error("UCP manifest must declare at least one capability");
}

console.log(`UCP manifest valid: ${manifest.protocol_version}; ${manifest.capabilities.length} capabilities`);
