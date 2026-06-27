import mongoose, { Schema, Document } from "mongoose";

export interface ICollectionPage extends Document {
  userId: mongoose.Types.ObjectId;
  slug: string; // unique: /c/[slug]
  title: string;
  description?: string;
  logo?: string; // Cloudinary URL
  questions: string[]; // max 3 custom questions
  allowText: boolean;
  allowPhoto: boolean;
  allowRating: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionPageSchema = new Schema<ICollectionPage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: String,
    logo: String,
    questions: {
      type: [String],
      default: ["What did you enjoy most about working with me?"],
    },
    allowText: { type: Boolean, default: true },
    allowPhoto: { type: Boolean, default: true },
    allowRating: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CollectionPageSchema.index({ userId: 1 });

export default (mongoose.models.CollectionPage as mongoose.Model<ICollectionPage>) ||
  mongoose.model<ICollectionPage>("CollectionPage", CollectionPageSchema);
