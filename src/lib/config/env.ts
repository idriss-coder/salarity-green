import { z } from "zod";

/**
 * Variables d'environnement validées au premier accès.
 * Lire `env` plutôt que `process.env` : une variable manquante échoue tôt et clairement.
 */
const schema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI manquant"),
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL invalide"),
  ADMIN_PASSWORD: z.string().min(8, "ADMIN_PASSWORD : 8 caractères minimum"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET : 32 caractères minimum"),
  DOWNLOAD_TOKEN_SECRET: z.string().min(32, "DOWNLOAD_TOKEN_SECRET : 32 caractères minimum"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `- ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Configuration invalide :\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}
