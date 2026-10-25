import BannerModel from "../models/banner.model.js";
import { fastCache, invalidateBanners } from "../utils/fastCache.js";

export const addBannerController = async (req, res) => {
    try {
        const { name, imageDesktop, imageMobile, link } = req.body;

        if (!imageDesktop) {
            return res.status(400).json({
                message: "Desktop image is required",
                error: true,
                success: false
            });
        }

        const payload = {
            name,
            imageDesktop,
            imageMobile: imageMobile || imageDesktop,
            link: link || ""
        };

        const banner = new BannerModel(payload);
        const saveBanner = await banner.save();

        if (saveBanner) {
            invalidateBanners();
            return res.json({
                message: "Banner added successfully",
                data: saveBanner,
                error: false,
                success: true
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};

export const getBannerController = async (req, res) => {
    try {
        return await fastCache.sendCached(req, res, "banner:all", async () => {
            const data = await BannerModel.find().sort({ createdAt: -1 }).lean();
            return {
                message: "Banner list retrieved",
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

export const updateBannerController = async (req, res) => {
    try {
        const { _id, name, imageDesktop, imageMobile, isActive, link } = req.body;

        const update = await BannerModel.updateOne({ _id: _id }, {
            name,
            imageDesktop,
            imageMobile,
            isActive,
            link
        });

        invalidateBanners();

        return res.json({
            message: "Banner updated successfully",
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

export const deleteBannerController = async (req, res) => {
    try {
        const { _id } = req.body;

        const deleteBanner = await BannerModel.deleteOne({ _id: _id });

        invalidateBanners();

        return res.json({
            message: "Banner deleted successfully",
            data: deleteBanner,
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
