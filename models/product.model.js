// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
    },

    slug: {
      type: String,
      unique: true,
      sparse: true, 
    },

    image: {
      type: [String],
      default: [],
    },

    video: {
      type: String,
      default: "",
    },

    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
      }
    ],

    subCategory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subCategory",
      }
    ],

    unit: {
      type: String,
      default: "",
    },

    stock: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      default: 0,
    },

    mrp: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    description: {
      type: String,
      default: "",
    },

    more_details: {
      type: Object,
      default: {},
    },

    publish: {
      type: Boolean,
      default: true,
    },
    variants: [
      {
        unit: { type: String, default: "" },
        price: { type: Number, default: 0 },
        mrp: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        stock: { type: Number, default: 0 }
      }
    ],
    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("discountPercent").get(function () {
  if (!this.mrp || this.mrp === 0) return 0;
  return Math.round(((this.mrp - this.price) / this.mrp) * 100);
});

productSchema.virtual("productUrl").get(function () {
  return `/product/${this.slug}`;
});

// Optimize searching with text indexing
productSchema.index({ name: "text", description: "text" });

// Optimize product lookups
productSchema.index({ category: 1, publish: 1 });
productSchema.index({ subCategory: 1, publish: 1 });
productSchema.index({ createdAt: -1 });

const ProductModel = mongoose.model("product", productSchema);
export default ProductModel;
