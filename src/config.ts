import dotenv from "dotenv";

dotenv.config();

const { DISCORD_TOKEN, DISCORD_CLIENT_ID, STORAGE_ACCOUNT_NAME, STORAGE_TABLE_NAME } = process.env;

if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID || !STORAGE_ACCOUNT_NAME || !STORAGE_TABLE_NAME) {
  throw new Error("Missing environment variables");
}

export const config = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  STORAGE_ACCOUNT_NAME,
  STORAGE_TABLE_NAME
};

