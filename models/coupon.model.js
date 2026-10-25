import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    discountPercent: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },

    minAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxDiscount: {
      type: Number,
      default: 200,
      min: 1,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    startDate: {
      type: Date,
      default: Date.now,
    },

    isFirstOrderOnly: {
      type: Boolean,
      default: false,
    },

    usageLimitPerUser: {
      type: Number,
      default: 1,
    },

    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      }
    ],

    isActive: {
      type: Boolean,
      default: true,
    }
  },

  { timestamps: true }
);

couponSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    next(new Error("Coupon code already exists"));
  } else {
    next(error);
  }
});

export default mongoose.model("Coupon", couponSchema);
