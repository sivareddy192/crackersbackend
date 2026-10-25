import { Router } from "express";
import { 
    loginDeliveryBoy, 
    getAssignedOrders, 
    updateOrderStatusByDeliveryBoy, 
    sendDeliveryOTP, 
    verifyDeliveryOTP,
    getDeliveryBoys,
    updateLocation
} from "../controllers/deliveryBoy.controller.js";
import auth from "../middleware/auth.js";

const deliveryBoyRouter = Router();

deliveryBoyRouter.post("/login", loginDeliveryBoy);
deliveryBoyRouter.get("/my-orders", auth, getAssignedOrders);
deliveryBoyRouter.put("/update-status", auth, updateOrderStatusByDeliveryBoy);

// OTP Verification Routes
deliveryBoyRouter.post("/send-otp", auth, sendDeliveryOTP);
deliveryBoyRouter.post("/verify-otp", auth, verifyDeliveryOTP);

// Admin Routes
deliveryBoyRouter.get("/get-delivery-boys", auth, getDeliveryBoys);

// Location Tracking
deliveryBoyRouter.put("/update-location", auth, updateLocation);

export default deliveryBoyRouter;
