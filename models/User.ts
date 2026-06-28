import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  username: string; // unique, used in /wall/[username]
  avatar?: string;
  plan: "free" | "starter" | "pro";
  lemonsqueezyCustomerId?: string;
  lemonsqueezySubscriptionId?: string;
  subscriptionStatus?: string;
  renewalDate?: Date;
  emailVerified?: Date;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  notifyOnNewTestimonial: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    avatar: String,
    plan: { type: String, enum: ["free", "starter", "pro"], default: "free" },
    lemonsqueezyCustomerId: String,
    lemonsqueezySubscriptionId: String,
    subscriptionStatus: String,
    renewalDate: Date,
    emailVerified: Date,
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    notifyOnNewTestimonial: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);
