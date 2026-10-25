import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderId: {
      type: String,
      required: [true, "Provide orderId"],
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },

    //FIXED: product snapshot stored properly
    product_details: {
      name: {
        type: String,
        default: "",
      },
      image: {
        type: [String],
        default: [], // always array
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },

    delivery_address: {   // ✅ ADD THIS
    type: mongoose.Schema.Types.ObjectId,
    ref: "address"
  },
    status: {
      type: String,
      default: "Pending",
      enum: [
        "Pending",
        "Confirmed",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending"
    },
    deliveryBoyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },



    address: {
      name: String,
      street: String,
      city: String,
      pincode: String,
      phone: String,
    },

    paymentId: {
      type: String,
      default: "",
    },

    payment_status: {
      type: String,
      default: "",
    },

    subTotalAmt: {
      type: Number,
      default: 0,
    },

    totalAmt: {
      type: Number,
      default: 0,
    },
    discountAmt: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: "",
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    handlingCharge: {
      type: Number,
      default: 0,
    },
    deliveryOTP: {
      type: String,
      default: null,
    },
    deliveryDate: {
      type: Date,
      default: null,
    },
    invoice_receipt: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Performance indexing
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ deliveryBoyId: 1 });

const OrderModel = mongoose.model("order", orderSchema);

export default OrderModel;