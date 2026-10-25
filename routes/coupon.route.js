import express from "express";
import Coupon from "../models/coupon.model.js";
import auth from "../middleware/auth.js";
import { admin } from "../middleware/Admin.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import sendEmail from "../config/sendEmail.js";
import offerEmailTemplate from "../utils/offerEmailTemplate.js";
import jwt from "jsonwebtoken";
import { fastCache, invalidateCoupons } from "../utils/fastCache.js";

const couponRouter = express.Router();

// CREATE Coupon (Admin)
couponRouter.post("/create", auth, admin, async (req, res) => {

    try {
        const { expiryDate, startDate, code } = req.body;

        if (new Date(expiryDate) < new Date()) {
            return res.json({
                success: false,
                message: "Expiry date cannot be in the past",
            });
        }

        if (startDate && new Date(expiryDate) < new Date(startDate)) {
            return res.json({
                success: false,
                message: "Expiry date cannot be before start date",
            });
        }

        const exists = await Coupon.findOne({ code: code.toUpperCase() });
        if (exists) {
            return res.json({
                success: false,
                message: "Coupon code already exists",
            });
        }

        const coupon = new Coupon({
            ...req.body,
            code: code.toUpperCase()
        });
        await coupon.save();
        invalidateCoupons();

        // AUTO-BROADCAST TO ALL USERS FOR NEW PUBLIC ACTIVE COUPONS
        if (coupon.isActive && !coupon.isFirstOrderOnly) {
            (async () => {
                try {
                    const users = await UserModel.find(
                        { email: { $regex: /@gmail\.com$/i } }, 
                        "name email"
                    );

                    if (!users.length) return;

                    const shopUrl = process.env.FRONTEND_URL || "https://tracly.store";
                    const broadcastSubject = `🔥 Hot Offer Released! Claim ${coupon.discountPercent}% OFF Now!`;

                    console.log(`[Auto-Broadcast] Commencing email blast for new Coupon: ${coupon.code} to ${users.length} active users.`);
                    
                    for (const user of users) {
                        try {
                            // Anti-rate limit throttling
                            await new Promise(resolve => setTimeout(resolve, 250));

                            const html = offerEmailTemplate({
                                name: user.name,
                                code: coupon.code,
                                discountPercent: coupon.discountPercent,
                                minAmount: coupon.minAmount,
                                maxDiscount: coupon.maxDiscount,
                                expiryDate: coupon.expiryDate,
                                headline: `We've Just Launched a New Discount!`,
                                description: `Exciting news! We've just released a fresh discount coupon just for you. Apply the code below during checkout to grab instantaneous savings on all your groceries today!`,
                                shopUrl: shopUrl
                            });

                            await sendEmail({
                                sendTo: user.email,
                                subject: broadcastSubject,
                                html: html
                            });
                        } catch (dispatchErr) {
                            // Fail silently for single user failures so loop continues
                        }
                    }
                    console.log(`[Auto-Broadcast] Finished blast for Coupon: ${coupon.code} successfully.`);
                } catch (err) {
                    console.error("[Auto-Broadcast Warning] Background loop failed:", err.message);
                }
            })().catch(criticalErr => console.error("[Auto-Broadcast Warning] Critical background catch:", criticalErr));
        }

        res.json({ success: true, message: "Coupon created", coupon });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// APPLY COUPON
couponRouter.post("/apply", auth, async (req, res) => {
    try {
        const { code, totalAmount } = req.body;
        const userId = req.userId;

        const [coupon, user] = await Promise.all([
            Coupon.findOne({ code: code.toUpperCase(), isActive: true }),
            UserModel.findById(userId)
        ]);

        if (!coupon)
            return res.json({ success: false, message: "Invalid coupon" });

        // Global check: Has this user EVER used this code?
        if (user.usedCoupons && user.usedCoupons.includes(code.toUpperCase())) {
            return res.json({
                success: false,
                message: "You have already used this coupon code before",
            });
        }

        // Check Start Date
        if (coupon.startDate && new Date(coupon.startDate) > new Date())
            return res.json({ success: false, message: "Coupon is not yet active" });

        // Check Expiry Date
        if (new Date(coupon.expiryDate) < new Date())
            return res.json({ success: false, message: "Coupon expired" });

        // Check Min Amount
        if (totalAmount < coupon.minAmount)
            return res.json({
                success: false,
                message: `Minimum order amount ₹${coupon.minAmount} required`,
            });

        // Check First User Only
        if (coupon.isFirstOrderOnly) {
            const orderCount = await OrderModel.countDocuments({ userId });
            if (orderCount > 0) {
                return res.json({
                    success: false,
                    message: "This coupon is only for first-time users",
                });
            }
        }

        // Check Usage Limit Per User
        if (coupon.usageLimitPerUser > 0) {
            const timesUsed = coupon.usedBy.filter(id => id.toString() === userId).length;
            if (timesUsed >= coupon.usageLimitPerUser) {
                return res.json({
                    success: false,
                    message: "You have already used this coupon maximum times",
                });
            }
        }

        let discountAmount = (coupon.discountPercent / 100) * totalAmount;

        if (discountAmount > coupon.maxDiscount)
            discountAmount = coupon.maxDiscount;

        return res.json({
            success: true,
            coupon,
            discountAmount,
            finalAmount: totalAmount - discountAmount,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET ALL COUPONS (Customers & Admin)
couponRouter.get("/all", async (req, res) => {
    try {
        // Run DB auto-expiration lazily in background so it never blocks HTTP request
        setImmediate(async () => {
            try {
                await Coupon.updateMany(
                    { expiryDate: { $lt: new Date() }, isActive: true },
                    { $set: { isActive: false } }
                );
            } catch (ignoreErr) {}
        });

        let isAdmin = false;
        const token = req.cookies?.accessToken || req?.headers?.authorization?.split(" ")[1];
        if (token) {
            try {
                const decode = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN);
                if (decode && decode.id) {
                    const user = await UserModel.findById(decode.id).select("role").lean();
                    if (user && user.role === 'ADMIN') {
                        isAdmin = true;
                    }
                }
            } catch (err) {
                // Ignore token errors, treat as customer
            }
        }

        // Admin gets fresh live coupons without caching
        if (isAdmin) {
            const now = new Date();
            let coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
            coupons = coupons.map(c => ({
                ...c,
                isExpired: new Date(c.expiryDate) < now
            }));
            return res.json({
                success: true,
                message: "Coupons fetched successfully",
                coupons,
            });
        }

        // Public / Customers get instantaneous response from RAM cache (~0.003ms)
        return await fastCache.sendCached(req, res, "coupon:public", async () => {
            const now = new Date();
            let coupons = await Coupon.find({
                isActive: true,
                expiryDate: { $gt: now }
            }).sort({ createdAt: -1 }).lean();

            coupons = coupons.map(c => ({
                ...c,
                isExpired: false
            }));

            return {
                success: true,
                message: "Coupons fetched successfully",
                coupons,
            };
        }, 180);

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// UPDATE COUPON (Admin)
couponRouter.put("/update/:id", auth, admin, async (req, res) => {

    try {
        const oldCoupon = await Coupon.findById(req.params.id);
        if (!oldCoupon) {
            return res.status(404).json({
                success: false,
                message: "Coupon not found",
            });
        }

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        // AUTO-BROADCAST IF A COUPON WAS ACTIVATED
        const wasActivated = !oldCoupon.isActive && updatedCoupon.isActive;

        if (wasActivated && !updatedCoupon.isFirstOrderOnly) {
            (async () => {
                try {
                    const users = await UserModel.find(
                        { email: { $regex: /@gmail\.com$/i } }, 
                        "name email"
                    );

                    if (!users.length) return;

                    const shopUrl = process.env.FRONTEND_URL || "https://tracly.store";
                    const broadcastSubject = `🔥 Hot Offer Released! Claim ${updatedCoupon.discountPercent}% OFF Now!`;

                    console.log(`[Auto-Broadcast] Commencing email blast for updated/activated Coupon: ${updatedCoupon.code} to ${users.length} active users.`);
                    
                    for (const user of users) {
                        try {
                            // Anti-rate limit throttling
                            await new Promise(resolve => setTimeout(resolve, 250));

                            const html = offerEmailTemplate({
                                name: user.name,
                                code: updatedCoupon.code,
                                discountPercent: updatedCoupon.discountPercent,
                                minAmount: updatedCoupon.minAmount,
                                maxDiscount: updatedCoupon.maxDiscount,
                                expiryDate: updatedCoupon.expiryDate,
                                headline: `We've Just Launched a New Discount!`,
                                description: `Exciting news! We've just released a fresh discount coupon just for you. Apply the code below during checkout to grab instantaneous savings on all your groceries today!`,
                                shopUrl: shopUrl
                            });

                            await sendEmail({
                                sendTo: user.email,
                                subject: broadcastSubject,
                                html: html
                            });
                        } catch (dispatchErr) {
                            // Fail silently for single user failures so loop continues
                        }
                    }
                    console.log(`[Auto-Broadcast] Finished blast for Coupon: ${updatedCoupon.code} successfully.`);
                } catch (err) {
                    console.error("[Auto-Broadcast Warning] Background loop failed:", err.message);
                }
            })().catch(criticalErr => console.error("[Auto-Broadcast Warning] Critical background catch:", criticalErr));
        }

        invalidateCoupons();

        res.json({
            success: true,
            message: "Coupon updated",
            updatedCoupon,
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// DELETE COUPON (Admin)
couponRouter.delete("/delete/:id", auth, admin, async (req, res) => {

    try {
        await Coupon.findByIdAndDelete(req.params.id);
        invalidateCoupons();

        res.json({
            success: true,
            message: "Coupon deleted",
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// SEND OFFER EMAIL TO ALL USERS (Admin)
couponRouter.post("/send-offer-email", auth, admin, async (req, res) => {
    try {
        const { couponId, subject, headline, description } = req.body;

        if (!couponId) {
            return res.json({ success: false, message: "Coupon ID is required" });
        }

        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
            return res.json({ success: false, message: "Coupon not found" });
        }

        // Fetch all Gmail users
        const users = await UserModel.find(
            { email: { $regex: /@gmail\.com$/i } }, 
            "name email"
        );

        if (!users.length) {
            return res.json({ success: false, message: "No Gmail users found to receive emails." });
        }

        const shopUrl = process.env.FRONTEND_URL || "https://tracly.store";
        const emailSubject = subject || `🎉 Special Offer! Get ${coupon.discountPercent}% OFF on Trace!`;

        // Immediately respond to client to avoid timing out
        res.json({ 
            success: true, 
            message: `Initiated email broadcast to ${users.length} users successfully.` 
        });

        // Execute sending in the background safely
        (async () => {
            console.log(`[Offer Broadcast] Starting broadcast to ${users.length} users for coupon: ${coupon.code}`);
            let successCount = 0;
            let failureCount = 0;

            for (const user of users) {
                try {
                    // Basic anti-rate-limiting delay of 200ms between individual Resend calls
                    await new Promise(resolve => setTimeout(resolve, 200));

                    const html = offerEmailTemplate({
                        name: user.name,
                        code: coupon.code,
                        discountPercent: coupon.discountPercent,
                        minAmount: coupon.minAmount,
                        maxDiscount: coupon.maxDiscount,
                        expiryDate: coupon.expiryDate,
                        headline: headline,
                        description: description,
                        shopUrl: shopUrl
                    });

                    await sendEmail({
                        sendTo: user.email,
                        subject: emailSubject,
                        html: html
                    });
                    successCount++;
                } catch (err) {
                    console.error(`[Offer Broadcast] Failed to send to ${user.email}:`, err.message);
                    failureCount++;
                }
            }
            console.log(`[Offer Broadcast] Completed! Success: ${successCount}, Failures: ${failureCount}`);
        })().catch(err => {
            console.error("[Offer Broadcast Error] Unhandled background error:", err);
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default couponRouter;