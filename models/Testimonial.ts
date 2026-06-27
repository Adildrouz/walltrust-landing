import mongoose, { Schema, Document } from "mongoose";

export interface ITestimonial extends Document {
  collectionPageId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  authorName: string;
  authorTitle?: string;
  authorCompany?: string;
  authorAvatar?: string; // Cloudinary URL
  text: string;
  rating?: number; // 1-5
  photo?: string; // Cloudinary URL
  status: "pending" | "approved" | "rejected";
  featured: boolean;
  source: "form";
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    collectionPageId: { type: Schema.Types.ObjectId, ref: "CollectionPage", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true, trim: true },
    authorTitle: String,
    authorCompany: String,
    authorAvatar: String,
    text: { type: String, required: true, maxlength: 2000 },
    rating: { type: Number, min: 1, max: 5 },
    photo: String,
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    featured: { type: Boolean, default: false },
    source: { type: String, default: "form" },
    approvedAt: Date,
  },
  { timestamps: true }
);

TestimonialSchema.index({ userId: 1, status: 1 });
TestimonialSchema.index({ collectionPageId: 1 });

export default (mongoose.models.Testimonial as mongoose.Model<ITestimonial>) ||
  mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
