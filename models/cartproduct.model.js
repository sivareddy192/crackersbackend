import mongoose from "mongoose";

const cartProductSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    unit: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
});

// Primary lookup index for O(1) cart page load by user
cartProductSchema.index({ userId: 1, createdAt: -1 });
// Unique constraint to prevent duplicate cart entries
cartProductSchema.index({ userId: 1, productId: 1, unit: 1 }, { unique: true });

const CartProductModel = mongoose.model("cartProduct", cartProductSchema);

export default CartProductModel;

