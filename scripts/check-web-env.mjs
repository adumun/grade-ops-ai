#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const profileArg = process.argv[process.argv.indexOf("--profile") + 1];
const profile = profileArg && !profileArg.startsWith("--") ? profileArg : "develop";
const envFile = path.join(root, "web", ".env.local");

const requiredFirebase = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

function readDotenv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const values = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || match[1].startsWith("#")) continue;
    values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
  return values;
}

const fileValues = readDotenv(envFile);
const valueFor = (name) => process.env[name] ?? fileValues[name] ?? "";
const placeholder = (value) =>
  !value || /^(__REQUIRED_|your-|000000|G-XXXXXXXX|local-emulator)/i.test(value);

if (profile === "local-preview") {
  console.log("Web profile OK: local-preview (Firebase and external services are not required).");
  process.exit(0);
}

if (profile === "local-integration") {
  try {
    execFileSync("docker", ["info"], { stdio: "ignore" });
  } catch {
    console.error("Web profile 'local-integration' requires a reachable Docker daemon; no Firebase credentials are substituted.");
    process.exit(2);
  }
  console.log("Web profile OK: local-integration (Docker/Emulator flow; no real Firebase credentials required).");
  process.exit(0);
}

const missing = requiredFirebase.filter((name) => !valueFor(name));
const placeholders = requiredFirebase.filter((name) => {
  const value = valueFor(name);
  return Boolean(value) && placeholder(value);
});

if (missing.length || placeholders.length) {
  console.error(`Web profile '${profile}' requires a real Firebase web configuration for build/runtime.`);
  if (missing.length) console.error(`Missing variables: ${missing.join(", ")}`);
  if (placeholders.length) console.error(`Placeholder variables: ${placeholders.join(", ")}`);
  console.error("Provide values through the shell environment or web/.env.local; no value is generated automatically.");
  process.exit(2);
}

console.log(`Web profile OK: ${profile} (Firebase public configuration is present; values not printed).`);
