import stripe from "../config/stripe.js";
import CartProductModel from "../models/cartproduct.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import Coupon from "../models/coupon.model.js";
import { createNotification, notifyAdmins, notifyDeliveryBoys } from "./notification.controller.js";
import ProductModel from "../models/product.model.js";
import mongoose from "mongoose";
import AddressModel from "../models/address.model.js";
import sendEmail from "../config/sendEmail.js";
import { orderReceiptTemplate } from "../utils/orderReceiptTemplate.js";

const getSellingPrice = (product, unit) => {
    const variant = product?.variants?.find(option => option.unit === unit);
    return Number(variant?.price ?? product?.price ?? 0);
};

export async function CashOnDeliveryOrderController(req, res) {
    try {
        const userId = req.userId
        const { list_items, totalAmt, addressId, subTotalAmt, discountAmt, couponCode, deliveryCharge, handlingCharge } = req.body

        // 🔥 CRITICAL FIX: Manually tell MongoDB to drop the unique constraint if it exists
        try {
            await OrderModel.collection.dropIndex("orderId_1")
            console.log("Successfully dropped duplicate orderId index")
        } catch (e) {
            // Index might already be gone, which is fine
        }

        if (!list_items || list_items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty",
                error: true,
                success: false
            })
        }

        if (!addressId) {
            return res.status(400).json({
                message: "Please select a delivery address",
                error: true,
                success: false
            })
        }

        const commonOrderId = `ORD-${new mongoose.Types.ObjectId().toString().slice(-6).toUpperCase()}`

        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 days from now

        const payload = list_items.filter(el => el.productId).map(el => {
            const product = el.productId?._id ? el.productId : el.productId; 
            
            const individualItemPrice = getSellingPrice(product, el.unit) * (el.quantity || 1)

            return {
                userId: userId,
                orderId: commonOrderId,
                productId: product._id || product,
                product_details: {
                    name: product.name || "Product",
                    image: Array.isArray(product.image) ? product.image : [product.image],
                    quantity: el.quantity || 1
                },
                paymentId: "",
                payment_status: "CASH ON DELIVERY",
                delivery_address: addressId,
                subTotalAmt: individualItemPrice, // Individual price
                totalAmt: totalAmt,               // Keep totalAmt for overall order reference
                discountAmt: discountAmt || 0,
                couponCode: couponCode || "",
                deliveryCharge: deliveryCharge || 0,
                handlingCharge: handlingCharge || 0,
                deliveryDate: deliveryDate,
            }
        })

        const generatedOrder = await OrderModel.insertMany(payload)

        // Fetch user and address for email receipt
        const user = await UserModel.findById(userId);
        const userEmail = user?.email || req.body.guestEmail;
        const userName = user?.name || "Customer";

        const addressDoc = await AddressModel.findById(addressId);
        const addressStr = addressDoc ? `${addressDoc.address_line}, ${addressDoc.city}, ${addressDoc.state} - ${addressDoc.pincode} (Phone: ${addressDoc.mobile})` : "N/A";

        const emailItems = list_items.filter(el => el.productId).map(el => {
            const product = el.productId?._id ? el.productId : el.productId;
            const price = getSellingPrice(product, el.unit) * (el.quantity || 1);
            
            const imageObj = product.image;
            let imageUrl = "https://placehold.co/80x80?text=Product";
            if (Array.isArray(imageObj) && imageObj.length > 0) {
                imageUrl = typeof imageObj[0] === 'string' ? imageObj[0] : (imageObj[0]?.secure_url || imageObj[0]?.url);
            } else if (typeof imageObj === 'string') {
                imageUrl = imageObj;
            } else if (imageObj && typeof imageObj === 'object') {
                imageUrl = imageObj.secure_url || imageObj.url;
            }
            if (imageUrl && imageUrl.startsWith("http://")) {
                imageUrl = imageUrl.replace("http://", "https://");
            }

            return {
                name: product.name || "Product",
                quantity: el.quantity || 1,
                price: price,
                image: imageUrl
            };
        });


        // 🚀 STEP 1: Parallelize Inventory Stock Deductions
        const stockUpdates = list_items.map(async (item) => {
            const pId = item.productId._id || item.productId;
            const quantity = item.quantity || 1;
            
            const updateOps = [];
            
            // Main product stock update
            updateOps.push(ProductModel.updateOne(
                { _id: pId },
                { $inc: { stock: -quantity } }
            ));

            // Variant stock update if exists
            if (item.unit) {
                updateOps.push(ProductModel.updateOne(
                    { _id: pId, "variants.unit": item.unit },
                    { $inc: { "variants.$.stock": -quantity } }
                ));
            }

            await Promise.all(updateOps);

            // Quick follow up check (runs in back if needed, but keep safe)
            ProductModel.findById(pId).select('name stock').lean().then(prod => {
                if (prod && prod.stock <= 5) {
                    notifyAdmins({
                        title: "Low Stock Alert",
                        message: `${prod.name} is running low (${prod.stock} left).`,
                        details: `Inventory for ${prod.name} has dropped below threshold. Please restock.`,
                        type: "warning",
                        event: "LOW_STOCK"
                    }).catch(e => {});
                }
            }).catch(e => {});
        });

        // Execute all stock updates at once
        await Promise.all(stockUpdates);

        // 🚀 STEP 2: Parallelize Core Cleanup 
        const cleanupTasks = [
            CartProductModel.deleteMany({ userId: userId }),
            UserModel.updateOne({ _id: userId }, { shopping_cart: [] })
        ];

        if (couponCode) {
            cleanupTasks.push(Coupon.updateOne({ code: couponCode.toUpperCase() }, { $push: { usedBy: userId } }));
            cleanupTasks.push(UserModel.updateOne({ _id: userId }, { $push: { usedCoupons: couponCode.toUpperCase() } }));
        }

        await Promise.all(cleanupTasks);

        // 🚀 STEP 3: Fire-off ALL side-effects (Email & Notifications) in Parallel
        const broadcastTasks = [];

        if (userEmail) {
            broadcastTasks.push(
                sendEmail({
                    sendTo: userEmail,
                    subject: `Order Confirmation #${commonOrderId} - Trace`,
                    html: orderReceiptTemplate({
                        name: userName,
                        orderId: commonOrderId,
                        items: emailItems,
                        totalAmt: totalAmt,
                        deliveryDate: deliveryDate,
                        address: addressStr
                    })
                }).catch(err => console.error("[Broadcast Fail] Email:", err.message))
            );
        }

        broadcastTasks.push(
            notifyAdmins({
                title: "New Order Received",
                message: `Order #${commonOrderId} has been placed.`,
                details: `Amount: ₹${totalAmt}. Method: CASH ON DELIVERY.`,
                type: "info",
                event: "NEW_ORDER"
            }).catch(err => console.error("[Broadcast Fail] Admin Notify:", err.message))
        );

        broadcastTasks.push(
            notifyDeliveryBoys({
                title: "New Order Available!",
                message: `Order #${commonOrderId} is ready for pickup.`,
                details: `A new order is available near your zone. Click to view on map.`,
                type: "warning",
                event: "NEW_ORDER_AVAILABLE"
            }).catch(err => console.error("[Broadcast Fail] Delivery Notify:", err.message))
        );

        // Wait for all network operations collectively (reduces total wait to the slowest single operation)
        await Promise.allSettled(broadcastTasks);

        return res.json({
            message: "Successfully Ordered",
            error: false,
            success: true,
            data: generatedOrder
        })

    } catch (error) {
        console.error("COD ORDER ERROR:", error)
        return res.status(500).json({
            message: error.message || "Order placement failed. If this persists, please clear your database orders collection.",
            error: true,
            success: false
        })
    }
}

export async function paymentController(request, response) {
    try {
        const userId = request.userId;
        const { list_items, addressId, subTotalAmt, totalAmt, deliveryCharge, handlingCharge, couponDiscount, couponId } = request.body;

        const user = await UserModel.findById(userId);

        const line_items = list_items.filter(item => item.productId).map(item => {
            const product = item.productId;
            const unitPrice = getSellingPrice(product, item.unit);

            return {
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: `${product?.name || "Product"} (${item.unit || product?.unit || ""})`,
                        images: product?.image && product.image.length > 0 ? [product.image[0]] : [],
                        metadata: {
                            productId: product?._id?.toString() || "",
                            unit: item.unit || product?.unit || ""
                        }
                    },
                    unit_amount: unitPrice * 100
                },
                quantity: item.quantity
            };
        });


        // Add Delivery Charge if any
        if (deliveryCharge > 0) {
            line_items.push({
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: "Delivery Charge",
                    },
                    unit_amount: deliveryCharge * 100
                },
                quantity: 1
            });
        }

        // Add Handling Charge if any
        if (handlingCharge > 0) {
            line_items.push({
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: "Handling Charge",
                    },
                    unit_amount: handlingCharge * 100
                },
                quantity: 1
            });
        }

        const params = {
            submit_type: "pay",
            mode: "payment",
            payment_method_types: ["card"],
            customer_email: user.email,
            metadata: {
                userId: userId,
                addressId: addressId,
                subTotalAmt: subTotalAmt,
                totalAmt: totalAmt,
                discountAmt: couponDiscount,
                couponCode: (await Coupon.findById(couponId))?.code || "",
                deliveryCharge: deliveryCharge,
                handlingCharge: handlingCharge,
            },
            line_items,
            success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/cancel`
        };

        // 🔥 FIX: Handle Discount using Stripe Coupons (Negative line items are not allowed)
        if (couponDiscount > 0) {
            const coupon = await stripe.coupons.create({
                amount_off: Math.round(couponDiscount * 100),
                currency: 'inr',
                duration: 'once',
            });
            params.discounts = [{ coupon: coupon.id }];
        }

        const session = await stripe.checkout.sessions.create(params);

        return response.status(200).json({
            id: session.id,
            url: session.url,  
        });

    } catch (error) {
        console.error("STRIPE ERROR:", error);
        return response.status(500).json({
            message: error.message || "Payment initialization failed",
            error: true,
            success: false
        });
    }
}

// Helper to create order and clear cart
async function createOrderHelper(session, lineItems) {
    const userId = session.metadata.userId;
    const addressId = session.metadata.addressId;
    const paymentId = session.payment_intent || session.id;
    
    const subTotalAmt = session.metadata.subTotalAmt;
    const totalAmt = session.metadata.totalAmt;
    const discountAmt = session.metadata.discountAmt;
    const couponCode = session.metadata.couponCode;
    const deliveryCharge = session.metadata.deliveryCharge;
    const handlingCharge = session.metadata.handlingCharge;

    // Check if order already exists for this payment/session to avoid duplicates
    const existingOrder = await OrderModel.findOne({ paymentId: paymentId });
    if (existingOrder) return;

    const orderProducts = [];
    const commonOrderId = `ORD-${new mongoose.Types.ObjectId().toString().slice(-6).toUpperCase()}`;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 days from now

    for (const item of lineItems.data) {
        let productId = "";
        let productName = item.description;
        let productImages = [];
        let unit = "";

        // Try to get productId and unit from product metadata
        try {
            const product = await stripe.products.retrieve(item.price.product);
            productId = product.metadata.productId;
            unit = product.metadata.unit || "";
            productImages = product.images;
        } catch (e) {
            console.log("Could not retrieve Stripe product metadata:", e.message);
        }

        // 🔥 CRITICAL FIX: Only save if it's a real product (skip charges)
        if (!productId) {
            console.log(`Skipping non-product item: ${productName}`);
            continue; 
        }

        orderProducts.push({
            userId: userId,
            orderId: commonOrderId,
            productId: productId,
            product_details: {
                name: productName,
                image: productImages,
                quantity: item.quantity,
                unit: unit // Store the specific variant unit
            },
            paymentId: paymentId,
            payment_status: "PAID",
            delivery_address: addressId,
            subTotalAmt: subTotalAmt || (item.amount_total / 100),
            totalAmt: totalAmt || (session.amount_total / 100),
            discountAmt: discountAmt || 0,
            couponCode: couponCode || "",
            deliveryCharge: deliveryCharge || 0,
            handlingCharge: handlingCharge || 0,
            deliveryDate: deliveryDate,
        });
    }

    if (orderProducts.length > 0) {
        await OrderModel.insertMany(orderProducts);

        // Fetch user and address for email receipt
        try {
            const user = await UserModel.findById(userId);
            const userEmail = user?.email;
            const userName = user?.name || "Customer";

            const addressDoc = await AddressModel.findById(addressId);
            const addressStr = addressDoc ? `${addressDoc.address_line}, ${addressDoc.city}, ${addressDoc.state} - ${addressDoc.pincode} (Phone: ${addressDoc.mobile})` : "N/A";

            const emailItems = orderProducts.map(item => {
                const imageObj = item.product_details?.image;
                let imageUrl = "https://placehold.co/80x80?text=Product";
                if (Array.isArray(imageObj) && imageObj.length > 0) {
                    imageUrl = typeof imageObj[0] === 'string' ? imageObj[0] : (imageObj[0]?.secure_url || imageObj[0]?.url);
                } else if (typeof imageObj === 'string') {
                    imageUrl = imageObj;
                } else if (imageObj && typeof imageObj === 'object') {
                    imageUrl = imageObj.secure_url || imageObj.url;
                }
                if (imageUrl && imageUrl.startsWith("http://")) {
                    imageUrl = imageUrl.replace("http://", "https://");
                }

                return {
                    name: item.product_details.name,
                    quantity: item.product_details.quantity,
                    price: item.subTotalAmt,
                    image: imageUrl
                };
            });

            if (userEmail) {
                await sendEmail({
                    sendTo: userEmail,
                    subject: `Order Confirmation #${commonOrderId} - Trace`,
                    html: orderReceiptTemplate({
                        name: userName,
                        orderId: commonOrderId,
                        items: emailItems,
                        totalAmt: totalAmt || (session.amount_total / 100),
                        deliveryDate: deliveryDate,
                        address: addressStr
                    })
                });
                console.log(`[Stripe Order Email] Dispatched to ${userEmail} successfully.`);
            }
        } catch (emailErr) {
            console.error("[Stripe Order Email] Failed to send email receipt:", emailErr.message);
        }

        // ✅ STEP 1: Parallelize Update Product Stocks (Main & Variant)
        const stockUpdates = orderProducts.map(async (item) => {
            if (!item.productId) return;
            
            const quantity = item.product_details.quantity || 1;
            const updateOps = [];
            
            // 1. Update Main Stock
            updateOps.push(ProductModel.updateOne(
                { _id: item.productId },
                { $inc: { stock: -quantity } }
            ));

            // 2. Update Variant Stock
            if (item.product_details.unit) {
                updateOps.push(ProductModel.updateOne(
                    { _id: item.productId, "variants.unit": item.product_details.unit },
                    { $inc: { "variants.$.stock": -quantity } }
                ));
            }

            await Promise.all(updateOps);

            // Check Low Stock in parallel non-blocking
            ProductModel.findById(item.productId).select('name stock').lean().then(prod => {
                if (prod && prod.stock <= 5) {
                    notifyAdmins({
                        title: "Low Stock Alert",
                        message: `${prod.name} is running low (${prod.stock} left).`,
                        details: `Product inventory for ${prod.name} has dropped below threshold. Please restock soon.`,
                        type: "warning",
                        event: "LOW_STOCK"
                    }).catch(e => {});
                }
            }).catch(e => {});
        });

        await Promise.all(stockUpdates);

        // ✅ STEP 2: Parallelize Cleanup and Coupon Usage
        const cleanupTasks = [
            CartProductModel.deleteMany({ userId: userId }),
            UserModel.updateOne({ _id: userId }, { shopping_cart: [] })
        ];

        if (couponCode) {
            cleanupTasks.push(Coupon.updateOne({ code: couponCode.toUpperCase() }, { $push: { usedBy: userId } }));
            cleanupTasks.push(UserModel.updateOne({ _id: userId }, { $push: { usedCoupons: couponCode.toUpperCase() } }));
        }
        
        await Promise.all(cleanupTasks);
        
        console.log("Order created and cart cleared for user:", userId);
    }
}

export async function verifyPaymentController(req, res) {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ success: false, message: "Session ID required" });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);

        if (session.payment_status === 'paid') {
            await createOrderHelper(session, lineItems);
            return res.json({
                success: true,
                message: "Payment verified and order created",
            });
        } else {
            return res.json({
                success: false,
                message: "Payment not completed",
            });
        }
    } catch (error) {
        console.error("VERIFY ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export async function webhookStripe(request, response) {
    const sig = request.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("WEBHOOK ERROR:", err.message);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        await createOrderHelper(session, lineItems);
    }

    response.json({ received: true });
}


export async function getOrderDetailsController(request,response){
    try {
        const userId = request.userId 

        if(!userId){
            return response.status(401).json({
                message : "Unauthorized",
                error : true,
                success : false
            })
        }

        const orderlist = await OrderModel.find({ userId : userId })
            .sort({ createdAt : -1 })
            .populate('delivery_address')
            .populate("productId", "name image price") 
            .populate("deliveryBoyId", "name mobile currentLatitude currentLongitude")

        return response.json({
            message : "order list",
            data : orderlist,
            error : false,
            success : true
        })

    } catch (error) {
        console.error("GET ORDER ERROR:", error)

        return response.status(500).json({
            message : error.message || "Internal Server Error",
            error : true,
            success : false
        })
    }
}

export async function getOrderByOrderIdController(req, res) {
    try {
        const { orderId } = req.params;
        const orders = await OrderModel.find({ orderId })
            .populate('userId', 'name email mobile')
            .populate('delivery_address')
            .populate('productId', 'name image price')
            .populate('deliveryBoyId', 'name mobile');

        if (!orders || orders.length === 0) {
            return res.status(404).json({
                message: "Order not found",
                success: false,
                error: true
            });
        }

        return res.json({
            message: "Order details fetched",
            data: orders,
            success: true,
            error: false
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        });
    }
}

export async function cancelOrderController(req, res){
    try {
        const userId = req.userId
        const { orderId } = req.params

        if(!orderId){
            return res.status(400).json({
                message: "Order ID required",
                error: true,
                success: false
            })
        }

        const initialOrder = await OrderModel.findOne({ _id: orderId, userId: userId })
        
        if(!initialOrder){
            return res.status(404).json({
                message: "Order not found",
                error: true,
                success: false
            })
        }

        // ✅ Only Pending orders can be cancelled
        if(initialOrder.status !== "Pending"){
            return res.status(400).json({
                message: "Order cannot be cancelled",
                error: true,
                success: false
            })
        }

        // ✅ Update ALL items with the same orderId
        const updatedOrders = await OrderModel.updateMany(
            { orderId: initialOrder.orderId, userId: userId },
            { $set: { status: "Cancelled" } }
        )

        return res.json({
            message: "Order cancelled successfully",
            success: true,
            error: false,
            data: updatedOrders
        })

    } catch (error) {
        console.error("CANCEL ORDER ERROR:", error)

        return res.status(500).json({
            message: error.message || "Internal Server Error",
            error: true,
            success: false
        })
    }
}

// ✅ Get All Orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await OrderModel.find()
      .populate("userId", "name email mobile")
      .populate("productId", "name price image")
      .populate("delivery_address")
      .populate("deliveryBoyId", "name mobile currentLatitude currentLongitude")
      .sort({ createdAt: -1 })

    res.status(200).json({
      message: "All orders fetched successfully",
      success: true,
      error: false,
      data: orders
    })

  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to fetch orders",
      success: false,
      error: true
    })
  }
}


// ✅ Update Order Status (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const initialOrder = await OrderModel.findById(id)
    if (!initialOrder) {
      return res.status(404).json({
        message: "Order not found",
        success: false,
        error: true
      })
    }

    // ✅ Update ALL items with the same orderId to keep them in sync
    const updatedOrder = await OrderModel.updateMany(
      { orderId: initialOrder.orderId },
      { status },
      { new: true }
    )

    res.status(200).json({
      message: "Order status updated",
      success: true,
      error: false,
      data: updatedOrder
    })

  } catch (error) {
    res.status(500).json({
      message: error.message || "Update failed",
      success: false,
      error: true
    })
  }
}

export const reorderController = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId } = req.body;

    console.log("🧪 Reorder request:", orderId);

    if (!orderId) {
      return res.status(400).json({
        message: "Order ID required",
      });
    }

    let orders = [];
    
    // ✅ FIX: Fetch ALL matching order documents to properly support multi-product orders
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      orders = await OrderModel.find({
        $or: [{ _id: orderId }, { orderId }],
      });
    } else {
      orders = await OrderModel.find({ orderId });
    }

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // ✅ EXTRACT ALL PRODUCTS AND QUANTITIES
    const items = orders.map(o => ({
      productId: o.productId || o.product_details?._id,
      quantity: o.product_details?.quantity || o.quantity || 1
    })).filter(item => item.productId);

    // ✅ ADD TO CART
    for (let item of items) {
      if (!item?.productId) continue;

      let cartItemDoc;

      const existing = await CartProductModel.findOne({
        userId,
        productId: item.productId,
      });

      if (existing) {
        existing.quantity += item.quantity || 1;
        cartItemDoc = await existing.save();
      } else {
        cartItemDoc = await CartProductModel.create({
          userId,
          productId: item.productId,
          quantity: item.quantity || 1,
        });
      }

      // ✅ CRITICAL SYNC: Add product into user model array to preserve full DB parity
      if (cartItemDoc) {
        await UserModel.updateOne(
          { _id: userId, shopping_cart: { $ne: cartItemDoc._id } }, 
          { $addToSet: { shopping_cart: cartItemDoc._id } }
        );
      }
    }

    return res.json({
      message: "Reorder success",
      success: true,
    });
  } catch (err) {
    console.error("REORDER ERROR:", err);

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

export async function deleteOrderController(req, res) {
    try {
        const { id } = req.params;
        const deletedOrder = await OrderModel.findByIdAndDelete(id);

        if (!deletedOrder) {
            return res.status(404).json({
                message: "Order not found",
                success: false,
                error: true
            });
        }

        res.status(200).json({
            message: "Order deleted successfully",
            success: true,
            error: false
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Delete failed",
            success: false,
            error: true
        });
    }
}

export async function assignOrderController(req, res) {
    try {
        const { orderId, deliveryBoyId } = req.body;
        
        const updatedOrders = await OrderModel.updateMany(
            { orderId: orderId },
            { deliveryBoyId: deliveryBoyId }
        );

        if (updatedOrders.matchedCount === 0) {
            return res.status(404).json({
                message: "Order not found",
                success: false
            });
        }

        res.json({
            message: "Order assigned successfully",
            success: true
        });
    } catch (error) {
        res.status(500).json({
            message: error.message || "Assignment failed",
            success: false
        });
    }
}

// ✅ Delivery Boy Scan & Assign
export const scanAndAssignOrderController = async (req, res) => {
    try {
        const { orderId } = req.body;
        const deliveryBoyId = req.userId; // From auth middleware

        if (!orderId) {
            return res.status(400).json({
                message: "Order ID is required",
                success: false
            });
        }

        // Check if order exists and isn't already assigned/delivered
        const order = await OrderModel.findOne({ orderId: orderId });

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
                success: false
            });
        }

        if (order.deliveryBoyId) {
            // If it's already assigned to the CURRENT person scanning, it's NOT an error
            if (order.deliveryBoyId.toString() === deliveryBoyId.toString()) {
                return res.status(200).json({
                    message: "Order already assigned to you!",
                    success: true
                });
            }

            return res.status(400).json({
                message: "Order is already assigned to another delivery boy",
                success: false
            });
        }

        if (order.status === "Delivered" || order.status === "Cancelled") {
            return res.status(400).json({
                message: `Cannot assign order with status: ${order.status}`,
                success: false
            });
        }

        // Update all items with this orderId
        await OrderModel.updateMany(
            { orderId: orderId },
            { 
                deliveryBoyId: deliveryBoyId,
                status: "Confirmed"
            }
        );

        // ✅ Notify Admin
        const dboy = await UserModel.findById(deliveryBoyId);
        await notifyAdmins({
            title: "Order Picked Up",
            message: `Order #${orderId} has been picked up by ${dboy?.name || "Delivery Boy"}.`,
            details: `Assignment completed by ${dboy?.name} (${dboy?.mobile}). Status updated to Confirmed.`,
            type: "success",
            event: "ORDER_PICKED"
        });

        return res.status(200).json({
            message: "Order successfully assigned to you!",
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Scan assignment failed",
            success: false
        });
    }
};

// ✅ Admin Stats: Total Sales, Today's Sales, Revenue
export const getAdminStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfToday   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Total orders (excluding Cancelled)
        const totalOrders = await OrderModel.countDocuments({ status: { $ne: "Cancelled" } });

        // Today's orders
        const todayOrders = await OrderModel.countDocuments({
            createdAt: { $gte: startOfToday, $lte: endOfToday },
            status: { $ne: "Cancelled" }
        });

        // Total revenue
        const revenueAgg = await OrderModel.aggregate([
            { $match: { status: { $ne: "Cancelled" } } },
            { $group: { _id: null, total: { $sum: "$subTotalAmt" } } }
        ]);
        const totalRevenue = revenueAgg[0]?.total || 0;

        // Today's revenue
        const todayRevenueAgg = await OrderModel.aggregate([
            { $match: { status: { $ne: "Cancelled" }, createdAt: { $gte: startOfToday, $lte: endOfToday } } },
            { $group: { _id: null, total: { $sum: "$subTotalAmt" } } }
        ]);
        const todayRevenue = todayRevenueAgg[0]?.total || 0;

        // This month revenue
        const monthRevenueAgg = await OrderModel.aggregate([
            { $match: { status: { $ne: "Cancelled" }, createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$subTotalAmt" } } }
        ]);
        const monthRevenue = monthRevenueAgg[0]?.total || 0;

        // Delivered count
        const deliveredCount = await OrderModel.countDocuments({ status: "Delivered" });

        // Pending count
        const pendingCount = await OrderModel.countDocuments({ status: { $in: ["Pending", "Confirmed", "Shipped", "Out for Delivery"] } });

        // Cancelled count
        const cancelledCount = await OrderModel.countDocuments({ status: "Cancelled" });

        // Top 5 sold products
        const topProducts = await OrderModel.aggregate([
            { $match: { status: { $ne: "Cancelled" } } },
            {
                $group: {
                    _id: "$productId",
                    name: { $first: "$product_details.name" },
                    image: { $first: "$product_details.image" },
                    totalSold: { $sum: "$product_details.quantity" },
                    revenue: { $sum: "$subTotalAmt" }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        // Recent 7 days daily revenue
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const dailyRevenue = await OrderModel.aggregate([
            { $match: { status: { $ne: "Cancelled" }, createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    revenue: { $sum: "$subTotalAmt" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);

        return res.status(200).json({
            success: true,
            data: {
                totalOrders,
                todayOrders,
                totalRevenue,
                todayRevenue,
                monthRevenue,
                deliveredCount,
                pendingCount,
                cancelledCount,
                topProducts,
                dailyRevenue
            }
        });

    } catch (error) {
        console.error("STATS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch stats"
        });
    }
};
