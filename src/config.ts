import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

export type TellerConfig = {
  accessToken: string;
  cert: string | Buffer;
  key: string | Buffer;
  baseUrl: string;
};

export function loadEnv(envPath?: string) {
  dotenv.config({ path: envPath });
}

export function loadConfig(): TellerConfig {
  const accessToken = requiredEnv("TELLER_ACCESS_TOKEN");
  const cert = pemFromEnv("TELLER_CERT", "TELLER_CERT_PATH");
  const key = pemFromEnv("TELLER_KEY", "TELLER_KEY_PATH");
  const baseUrl = process.env.TELLER_API_BASE_URL ?? "https://api.teller.io";

  return { accessToken, cert, key, baseUrl };
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function pemFromEnv(valueName: string, pathName: string): string | Buffer {
  const inline = process.env[valueName];
  if (inline) return inline.replaceAll("\\n", "\n");

  const filePath = process.env[pathName];
  if (!filePath) {
    throw new Error(`Set ${valueName} or ${pathName}`);
  }

  return fs.readFileSync(path.resolve(filePath));
}
