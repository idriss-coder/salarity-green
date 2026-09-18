import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Une soumission = réponses brutes + snapshot de calcul immuable + PDF généré.
 * Le snapshot et les réponses sont stockés tels quels (Mixed) : leur structure est garantie
 * par Zod (réponses) et par le moteur (snapshot), pas par Mongoose.
 */
const SubmissionSchema = new Schema(
  {
    schemaVersion: { type: Number, required: true },
    engineVersion: { type: String, required: true },
    email: { type: String, required: true, index: true, lowercase: true, trim: true },
    company: {
      name: { type: String, required: true },
      sector: { type: String, required: true },
      city: { type: String, required: true },
      contactName: { type: String },
    },
    answers: { type: Schema.Types.Mixed, required: true },
    snapshot: { type: Schema.Types.Mixed, required: true },
    pdf: {
      data: { type: Buffer, required: true },
      size: { type: Number, required: true },
      sha256: { type: String, required: true },
      generatedAt: { type: Date, required: true },
    },
    /** Jeton aléatoire du lien de téléchargement client (page Merci). */
    downloadToken: { type: String, required: true, unique: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "submissions" },
);

export type SubmissionDoc = InferSchemaType<typeof SubmissionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Submission: Model<SubmissionDoc> =
  (mongoose.models.Submission as Model<SubmissionDoc>) ??
  mongoose.model<SubmissionDoc>("Submission", SubmissionSchema);
