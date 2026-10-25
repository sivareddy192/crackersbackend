// models/deliveryBoy.model.js
import mongoose from "mongoose";

const deliveryBoySchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true
  },
  password: String,
  phone: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model("DeliveryBoy", deliveryBoySchema);