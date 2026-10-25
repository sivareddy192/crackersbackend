import { Router } from 'express'
import auth from '../middleware/auth.js'
import { admin } from '../middleware/Admin.js'

import {
    getAllOrders,
    updateOrderStatus,
    getAdminStats
} from '../controllers/order.controller.js'

const adminRouter = Router()

adminRouter.get("/orders", auth, admin, getAllOrders)
adminRouter.put("/orders/:id", auth, admin, updateOrderStatus)
adminRouter.get("/stats", auth, admin, getAdminStats)

export default adminRouter;