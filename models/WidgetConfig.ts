import mongoose, { Schema, Document } from "mongoose";

export interface IWidgetConfig extends Document {
  userId: mongoose.Types.ObjectId;
  style: "grid" | "carousel" | "single" | "badge";
  colorBg: string;
  colorText: string;
  colorAccent: string;
  showRating: boolean;
  showAvatar: boolean;
  maxItems: number;
  filterMinRating: number;
  createdAt: Date;
  updatedAt: Date;
}

const WidgetConfigSchema = new Schema<IWidgetConfig>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    style: {
      type: String,
      enum: ["grid", "carousel", "single", "badge"],
      default: "grid",
    },
    colorBg: { type: String, default: "#ffffff" },
    colorText: { type: String, default: "#0f172a" },
    colorAccent: { type: String, default: "#3730a3" },
    showRating: { type: Boolean, default: true },
    showAvatar: { type: Boolean, default: true },
    maxItems: { type: Number, default: 6 },
    filterMinRating: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default (mongoose.models.WidgetConfig as mongoose.Model<IWidgetConfig>) ||
  mongoose.model<IWidgetConfig>("WidgetConfig", WidgetConfigSchema);
