import express from 'express'
import auth from '../middleware/auth.js'
import { cancelOrderController, CashOnDeliveryOrderController, getOrderDetailsController, paymentController, webhookStripe, reorderController, verifyPaymentController, deleteOrderController, assignOrderController, scanAndAssignOrderController, getOrderByOrderIdController } from '../controllers/order.controller.js'

const orderRouter = express.Router()

orderRouter.post("/cash-on-delivery", auth, CashOnDeliveryOrderController)
orderRouter.post('/checkout', auth, paymentController)
orderRouter.post('/verify-payment', auth, verifyPaymentController)
orderRouter.post('/webhook', express.raw({ type: 'application/json' }), webhookStripe)

// ✅ Get My Orders
orderRouter.get("/my-orders", auth, getOrderDetailsController);
orderRouter.get("/order-items/:orderId", auth, getOrderByOrderIdController);

orderRouter.post("/assign", auth, assignOrderController);
orderRouter.post("/scan-assign", auth, scanAndAssignOrderController);
// ✅ Cancel Order
orderRouter.put("/cancel/:orderId", auth, cancelOrderController);
orderRouter.delete("/delete/:id", auth, deleteOrderController);
orderRouter.post("/reorder", auth, reorderController);

export default orderRouter;