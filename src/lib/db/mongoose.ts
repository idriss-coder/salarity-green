import mongoose from "mongoose";
import { getEnv } from "@/lib/config/env";

/**
 * Connexion Mongoose mise en cache sur l'objet global : en serverless (Vercel),
 * chaque invocation peut réutiliser la connexion du conteneur chaud au lieu d'en ouvrir une nouvelle.
 */
type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

const globalWithMongoose = globalThis as typeof globalThis & { __mongoose?: Cache };
const cache: Cache = globalWithMongoose.__mongoose ?? { conn: null, promise: null };
globalWithMongoose.__mongoose = cache;

export async function connectDb(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(getEnv().MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8_000,
    });
  }
  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
  return cache.conn;
}
