import { Router } from "express";
import auth from "../middleware/auth.js";
import { 
    getNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
} from "../controllers/notification.controller.js";

const notificationRouter = Router();

notificationRouter.get("/get", auth, getNotifications);
notificationRouter.put("/mark-read/:id", auth, markAsRead);
notificationRouter.put("/mark-all-read", auth, markAllAsRead);
notificationRouter.delete("/delete/:id", auth, deleteNotification);

export default notificationRouter;
