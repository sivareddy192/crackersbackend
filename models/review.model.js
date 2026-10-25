import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.ObjectId,
        ref: 'product',
        required: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

const ReviewModel = mongoose.model('review', reviewSchema);

export default ReviewModel;
