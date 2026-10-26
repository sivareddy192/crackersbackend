import ReviewModel from "../models/review.model.js";
import UserModel from "../models/user.model.js";

export async function addReviewController(req, res) {
    try {
        const { productId, rating, comment, image } = req.body;
        const userId = req.userId;
        
        const user = await UserModel.findById(userId);
        const userName = user?.name || "Customer";

        if (!productId || !rating || !comment) {
            return res.status(400).json({
                message: "All fields are required",
                error: true,
                success: false
            });
        }

        const existingReview = await ReviewModel.findOne({ productId, userId });
        if (existingReview) {
            return res.status(400).json({
                message: "You have already reviewed this product",
                error: true,
                success: false
            });
        }

        const newReview = new ReviewModel({
            productId,
            userId,
            userName,
            rating,
            comment,
            image: image || ""
        });

        await newReview.save();

        return res.json({
            message: "Review added successfully",
            success: true,
            error: false,
            data: newReview
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function getProductReviewsController(req, res) {
    try {
        const { productId } = req.params;

        const reviews = await ReviewModel.find({ productId }).sort({ createdAt: -1 });

        return res.json({
            message: "Product reviews fetched",
            success: true,
            error: false,
            data: reviews
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function getAllReviewsController(req, res) {
    try {
        const reviews = await ReviewModel.find().sort({ createdAt: -1 });

        return res.json({
            message: "All reviews fetched",
            success: true,
            error: false,
            data: reviews
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function updateReviewController(req, res) {
    try {
        const { _id, rating, comment, image } = req.body;

        if (!_id) {
            return res.status(400).json({
                message: "Review ID is required",
                error: true,
                success: false
            });
        }

        const updatedReview = await ReviewModel.findByIdAndUpdate(_id, {
            rating,
            comment,
            image
        }, { new: true });

        if (!updatedReview) {
            return res.status(404).json({
                message: "Review not found",
                error: true,
                success: false
            });
        }

        return res.json({
            message: "Review updated successfully",
            success: true,
            error: false,
            data: updatedReview
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

export async function deleteReviewController(req, res) {
    try {
        const { _id } = req.body;

        if (!_id) {
            return res.status(400).json({
                message: "Review ID is required",
                error: true,
                success: false
            });
        }

        const deletedReview = await ReviewModel.findByIdAndDelete(_id);

        if (!deletedReview) {
            return res.status(404).json({
                message: "Review not found",
                error: true,
                success: false
            });
        }

        return res.json({
            message: "Review deleted successfully",
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
}
