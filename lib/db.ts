import "server-only";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not set. Add it to .env.local.");

// Reuse one client across hot reloads in development, so connections are not leaked.
const cache = globalThis as typeof globalThis & { _mongoClient?: MongoClient };

export const client = cache._mongoClient ?? new MongoClient(uri, { appName: "crop-doctor" });
if (process.env.NODE_ENV !== "production") cache._mongoClient = client;

export const db = client.db("crop_doctor");
