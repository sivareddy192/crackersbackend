import FestivalOfferModel from "../models/festivalOffer.model.js";
import sendEmail from "../config/sendEmail.js";
import UserModel from "../models/user.model.js";
import festivalOfferEmailTemplate from "../utils/festivalOfferEmailTemplate.js";
import { fastCache, invalidateFestivalOffers } from "../utils/fastCache.js";

export const addFestivalOfferController = async (req, res) => {
    try {
        const { title, subTitle, image, discountPercent, couponCode, link } = req.body;

        if (!image) {
            return res.status(400).json({
                message: "Festival offer image is required",
                error: true,
                success: false
            });
        }

        const payload = {
            title: title || "",
            subTitle: subTitle || "",
            image,
            discountPercent: Number(discountPercent) || 0,
            couponCode: couponCode || "",
            link: link || ""
        };

        const offer = new FestivalOfferModel(payload);
        const saveOffer = await offer.save();

        (async () => {
            try {
                const users = await UserModel.find(
                    { email: { $regex: /@gmail\.com$/i } }, 
                    "name email"
                );

                if (!users.length) return;

                const shopUrl = process.env.FRONTEND_URL || "https://tracly.store";
                
                let targetUrl = shopUrl;
                if (saveOffer.link) {
                    if (saveOffer.link.startsWith("http://") || saveOffer.link.startsWith("https://")) {
                        targetUrl = saveOffer.link;
                    } else {
                        const formattedPath = saveOffer.link.startsWith("/") ? saveOffer.link : `/${saveOffer.link}`;
                        targetUrl = `${shopUrl}${formattedPath}`;
                    }
                }

                console.log(`[Festive-Broadcast] Loading mail distribution for '${saveOffer.title}' across ${users.length} buyers.`);

                for (const user of users) {
                    try {
                        await new Promise(resolve => setTimeout(resolve, 250));

                        const html = festivalOfferEmailTemplate({
                            name: user.name,
                            title: saveOffer.title,
                            subTitle: saveOffer.subTitle,
                            image: saveOffer.image,
                            discountPercent: saveOffer.discountPercent,
                            couponCode: saveOffer.couponCode,
                            targetUrl: targetUrl
                        });

                        await sendEmail({
                            sendTo: user.email,
                            subject: `🎉 Festive Special: ${saveOffer.title} Deal is LIVE!`,
                            html: html
                        });
                    } catch (sendErr) {
                    }
                }
                console.log(`[Festive-Broadcast] Successfully dispatched blast for '${saveOffer.title}'.`);
            } catch (blastErr) {
                console.error("[Festive-Broadcast Warning] Async batch failure:", blastErr.message);
            }
        })().catch(bgErr => console.error("[Festive-Broadcast Warning] Background thread crashed:", bgErr));

        invalidateFestivalOffers();

        return res.json({
            message: "Festival offer created successfully",
            data: saveOffer,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const getFestivalOfferController = async (req, res) => {
    try {
        return await fastCache.sendCached(req, res, "festivalOffer:all", async () => {
            const data = await FestivalOfferModel.find().sort({ createdAt: -1 }).lean();
            return {
                message: "Festival offers retrieved successfully",
                data: data,
                error: false,
                success: true
            };
        }, 300);
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const updateFestivalOfferController = async (req, res) => {
    try {
        const { _id, title, subTitle, image, discountPercent, couponCode, isActive, link } = req.body;

        if (!_id) {
            return res.status(400).json({
                message: "Festival Offer ID is required",
                error: true,
                success: false
            });
        }

        const update = await FestivalOfferModel.updateOne({ _id: _id }, {
            title,
            subTitle,
            image,
            discountPercent: Number(discountPercent) || 0,
            couponCode,
            isActive,
            link
        });

        invalidateFestivalOffers();

        return res.json({
            message: "Festival offer updated successfully",
            data: update,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const deleteFestivalOfferController = async (req, res) => {
    try {
        const { _id } = req.body;

        if (!_id) {
            return res.status(400).json({
                message: "Festival Offer ID is required",
                error: true,
                success: false
            });
        }

        const deleteOffer = await FestivalOfferModel.deleteOne({ _id: _id });

        invalidateFestivalOffers();

        return res.json({
            message: "Festival offer deleted successfully",
            data: deleteOffer,
            error: false,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const sendFestivalOfferBlastController = async (req, res) => {
    try {
        const { _id } = req.body;

        if (!_id) {
            return res.status(400).json({
                message: "Festival Offer ID is required",
                error: true,
                success: false
            });
        }

        const offer = await FestivalOfferModel.findById(_id);
        if (!offer) {
            return res.status(404).json({
                message: "Festival offer not found",
                error: true,
                success: false
            });
        }

        (async () => {
            try {
                const users = await UserModel.find(
                    { email: { $regex: /@gmail\.com$/i } }, 
                    "name email"
                );

                if (!users.length) return;

                const shopUrl = process.env.FRONTEND_URL || "https://tracly.store";
                
                let targetUrl = shopUrl;
                if (offer.link) {
                    if (offer.link.startsWith("http://") || offer.link.startsWith("https://")) {
                        targetUrl = offer.link;
                    } else {
                        const formattedPath = offer.link.startsWith("/") ? offer.link : `/${offer.link}`;
                        targetUrl = `${shopUrl}${formattedPath}`;
                    }
                }

                console.log(`[Manual-Festive-Blast] Loading distribution list for '${offer.title}' with ${users.length} recipients.`);

                for (const user of users) {
                    try {
                        await new Promise(resolve => setTimeout(resolve, 250));

                        const html = festivalOfferEmailTemplate({
                            name: user.name,
                            title: offer.title,
                            subTitle: offer.subTitle,
                            image: offer.image,
                            discountPercent: offer.discountPercent,
                            couponCode: offer.couponCode,
                            targetUrl: targetUrl
                        });

                        await sendEmail({
                            sendTo: user.email,
                            subject: `🎉 Festive Special: ${offer.title} Deal is LIVE!`,
                            html: html
                        });
                    } catch (mailErr) {
                    }
                }
                console.log(`[Manual-Festive-Blast] Finished distributing campaign: '${offer.title}'.`);
            } catch (err) {
                console.error("[Manual-Festive-Blast Error] Asynchronous blast iteration failed:", err.message);
            }
        })().catch(err => console.error("[Manual-Festive-Blast Error] Background executor crash:", err));

        return res.json({
            message: "Email broadcast dispatched successfully!",
            success: true,
            error: false
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};
