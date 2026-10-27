import { Router } from 'express'
import auth from '../middleware/auth.js'
import { admin } from '../middleware/Admin.js'

import {
    getAllOrders,
    updateOrderStatus,
    getAdminStats,
    getOrderByOrderIdController,
    deleteOrderController,
    assignOrderController
} from '../controllers/order.controller.js'

const adminRouter = Router()

// Stats route first (no :id conflict)
adminRouter.get("/stats", auth, admin, getAdminStats)

// All orders
adminRouter.get("/orders", auth, admin, getAllOrders)

// Single order by orderId (GET)
adminRouter.get("/orders/:orderId", auth, admin, getOrderByOrderIdController)

// Update order status (PUT)
adminRouter.put("/orders/:id", auth, admin, updateOrderStatus)

// Delete entire order group (DELETE) - admin-only endpoint
adminRouter.delete("/orders/:id", auth, admin, deleteOrderController)

// Assign delivery boy (POST)
adminRouter.post("/orders/assign", auth, admin, assignOrderController)

export default adminRouter;