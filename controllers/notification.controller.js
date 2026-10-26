import NotificationModel from "../models/notification.model.js";
import UserModel from "../models/user.model.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await UserModel.findById(userId);
        const { role } = req.query; 

        let query = { userId };
        
        if (user.role === 'ADMIN' && role === 'ALL') {
            query = { role: { $in: ['ADMIN', 'DELIVERY_BOY'] } };
        } else if (role) {
            query.role = role;
        }

        const notifications = await NotificationModel.find(query).sort({ createdAt: -1 });

        return res.json({
            message: "Notifications fetched",
            data: notifications,
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

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await NotificationModel.findByIdAndUpdate(id, { read: true });

        return res.json({
            message: "Marked as read",
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

export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.userId;
        await NotificationModel.updateMany({ userId, read: false }, { read: true });

        return res.json({
            message: "All marked as read",
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

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await NotificationModel.findByIdAndDelete(id);

        return res.json({
            message: "Notification deleted",
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

export const createNotification = async ({ userId, title, message, details, type, event, role }) => {
    try {
        const newNotification = new NotificationModel({
            userId,
            title,
            message,
            details,
            type,
            event,
            role
        });
        await newNotification.save();
        return newNotification;
    } catch (error) {
        console.error("Failed to create notification:", error);
    }
};

export const notifyAdmins = async (data) => {
    const admins = await UserModel.find({ role: 'ADMIN' });
    for (const admin of admins) {
        await createNotification({ ...data, userId: admin._id, role: 'ADMIN' });
    }
};

export const notifyDeliveryBoys = async (data) => {
    const boys = await UserModel.find({ role: 'DELIVERY_BOY' });
    for (const boy of boys) {
        await createNotification({ ...data, userId: boy._id, role: 'DELIVERY_BOY' });
    }
};
