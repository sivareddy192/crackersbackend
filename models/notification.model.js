import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    details: {
        type: String
    },
    type: {
        type: String,
        enum: ['success', 'warning', 'info', 'error'],
        default: 'info'
    },
    event: {
        type: String, // 'NEW_ORDER', 'LOW_STOCK', 'ORDER_PICKED', 'ORDER_DELIVERED', etc.
    },
    read: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['ADMIN', 'DELIVERY_BOY', 'USER'],
        default: 'ADMIN'
    }
}, {
    timestamps: true
});

// Auto-delete after 24 hours using TTL index
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const NotificationModel = mongoose.model('Notification', notificationSchema);

export default NotificationModel;
