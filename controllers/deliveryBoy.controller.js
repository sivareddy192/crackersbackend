import UserModel from "../models/user.model.js";
import OrderModel from "../models/order.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import generateOtp from "../utils/generateOtp.js";
import sendEmail from "../config/sendEmail.js";
import deliveryOtpTemplate from "../utils/deliveryOtpTemplate.js";
import { createNotification, notifyAdmins } from "./notification.controller.js";

export const loginDeliveryBoy = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email, role: "DELIVERY_BOY" });

        if (!user) {
            return res.status(404).json({ message: "Delivery boy not found or role not assigned", error: true });
        }

        if (user.status !== "Active") {
            return res.status(401).json({ 
                message: `Your account is ${user.status}. Please contact admin.`, 
                error: true 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials", error: true });
        }

        const token = jwt.sign({ id: user._id, role: 'DELIVERY_BOY' }, process.env.SECRET_KEY_ACCESS_TOKEN, { expiresIn: '1d' });

        res.cookie("accessToken", token, { httpOnly: true, secure: true, sameSite: 'None' });

        return res.json({
            message: "Login successful",
            data: { name: user.name, email: user.email, role: 'DELIVERY_BOY', id: user._id },
            token,
            success: true
        });
    } catch (error) {
        return res.status(500).json({ message: error.message, error: true });
    }
};

export const getAssignedOrders = async (req, res) => {
    try {
        const orders = await OrderModel.find({ deliveryBoyId: req.userId })
            .populate("userId", "name email mobile")
            .populate("delivery_address")
            .populate("productId", "name image price")
            .sort({ createdAt: -1 });

        return res.json({ data: orders, success: true });
    } catch (error) {
        return res.status(500).json({ message: error.message, error: true });
    }
};
export const sendDeliveryOTP = async (req, res) => {
    try {
        const { orderId } = req.body;
        
        if (!orderId) {
            return res.status(400).json({ message: "Provide orderId", error: true });
        }

        const order = await OrderModel.findById(orderId).populate("userId", "email name");

        if (!order) {
            return res.status(404).json({ message: "Order not found", error: true });
        }

        if (!order.userId || !order.userId.email) {
            return res.status(400).json({ message: "Customer email not found for this order", error: true });
        }

        const otp = generateOtp();
        order.deliveryOTP = otp;
        
        if (order.status !== "Out for Delivery") {
            order.status = "Out for Delivery";
        }
        await order.save();

        try {
            await sendEmail({
                sendTo: order.userId.email,
                subject: `Delivery OTP for Order #${order.orderId || order._id}`,
                html: deliveryOtpTemplate({
                    name: order.userId.name,
                    otp: otp,
                    orderId: order.orderId || order._id
                })
            });

            await notifyAdmins({
                title: "Order Out for Delivery",
                message: `Order #${order.orderId || order._id} is out for delivery.`,
                details: `Delivery partner ${req.userId} has started the delivery process. OTP sent to customer.`,
                type: "info",
                event: "ORDER_OUT"
            });

            return res.json({ message: "OTP sent to customer email", success: true });
        } catch (emailError) {
            return res.status(500).json({ 
                message: "Email failed to send. Please check your EMAIL_USER and EMAIL_PASS configuration.", 
                error: true
            });
        }
    } catch (error) {
        console.error("sendDeliveryOTP Error:", error);
        return res.status(500).json({ message: "Internal server error during OTP generation", error: true });
    }
};

export const verifyDeliveryOTP = async (req, res) => {
    try {
        const { orderId, otp } = req.body;
        const order = await OrderModel.findById(orderId);

        if (!order) return res.status(404).json({ message: "Order not found", error: true });

        if (order.deliveryOTP !== otp) {
            return res.status(400).json({ message: "Invalid OTP", error: true });
        }

        order.status = "Delivered";
        order.deliveryOTP = null;
        await order.save();

        await notifyAdmins({
            title: "Order Delivered!",
            message: `Order #${order.orderId || order._id} has been delivered.`,
            details: `Successful OTP verification. Order completed.`,
            type: "success",
            event: "ORDER_DELIVERED"
        });

        return res.json({ message: "Order delivered successfully!", success: true });
    } catch (error) {
        return res.status(500).json({ message: error.message, error: true });
    }
};

export const updateOrderStatusByDeliveryBoy = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        
        if (status === "Delivered") {
            return res.status(400).json({ 
                message: "Direct 'Delivered' status update is not allowed. Please use OTP verification.", 
                error: true 
            });
        }

        const updatedOrder = await OrderModel.findByIdAndUpdate(orderId, { status }, { new: true });
        return res.json({ message: "Status updated", data: updatedOrder, success: true });
    } catch (error) {
        return res.status(500).json({ message: error.message, error: true });
    }
};

export const getDeliveryBoys = async (req, res) => {
    try {
        // Only return Active delivery boys so admin can only assign to activated accounts
        const deliveryBoys = await UserModel.find({ 
            role: "DELIVERY_BOY", 
            status: "Active" 
        }).select("name email mobile _id status");
        return res.json({ data: deliveryBoys, success: true });
    } catch (error) {
        return res.status(500).json({ message: error.message, error: true });
    }
};

export const updateLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        await UserModel.findByIdAndUpdate(req.userId, {
            currentLatitude: latitude,
            currentLongitude: longitude
        });
        return res.json({ message: "Location updated", success: true });
    } catch (error) {
        return res.status(500).json({ message: error.message, error: true });
    }
};
