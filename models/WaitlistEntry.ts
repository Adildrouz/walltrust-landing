import mongoose, { Schema, Document } from "mongoose";

export interface IWaitlistEntry extends Document {
  email: string;
  status: "pending" | "invited" | "converted";
  source?: string;
  couponUsed: boolean;
  couponCode?: string;
  invitedAt?: Date;
  convertedAt?: Date;
  createdAt: Date;
}

const WaitlistEntrySchema = new Schema<IWaitlistEntry>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: { type: String, enum: ["pending", "invited", "converted"], default: "pending" },
    source: { type: String, default: "direct" },
    couponUsed: { type: Boolean, default: false },
    couponCode: String,
    invitedAt: Date,
    convertedAt: Date,
  },
  { timestamps: true }
);

WaitlistEntrySchema.index({ email: 1 }, { unique: true });
WaitlistEntrySchema.index({ status: 1 });

export default mongoose.models.WaitlistEntry ||
  mongoose.model<IWaitlistEntry>("WaitlistEntry", WaitlistEntrySchema);
