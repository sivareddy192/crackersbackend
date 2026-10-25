import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.index({ createdAt: -1 });
categorySchema.index({ name: 1 });

const CategoryModel = mongoose.model("category", categorySchema);

export default CategoryModel;
