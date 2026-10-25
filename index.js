import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import compression from 'compression'
import connectDB from './config/connectDB.js'
import userRouter from './routes/user.route.js'
import categoryRouter from './routes/category.route.js'
import uploadRouter from './routes/upload.route.js'
import subCategoryRouter from './routes/subCategory.route.js'
import productRouter from './routes/product.route.js'
import cartRouter from './routes/cart.route.js'
import addressRouter from './routes/address.route.js'
import orderRouter from './routes/order.route.js'
import deliveryBoyRouter from './routes/deliveryBoy.route.js'
import bannerRouter from './routes/banner.route.js'
import adminRouter from './routes/admin.route.js'
import couponRouter from './routes/coupon.route.js'
import reviewRouter from './routes/review.route.js'
import notificationRouter from './routes/notification.route.js'
import festivalOfferRouter from './routes/festivalOffer.route.js'
const app = express()

const rawFrontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.trim() : ""
const cleanFrontendUrl = rawFrontendUrl.replace(/\/+$/, "")

const allowedOrigins = [
    cleanFrontendUrl,
    rawFrontendUrl,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://tracly-crackers.vercel.app",
    "https://trace-1.vercel.app"
].filter(Boolean)

app.use(cors({
    credentials : true,
    origin : (origin, callback) => {
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            return callback(null, true)
        }
        return callback(null, false)
    }
}))
app.use(express.json())
app.use(compression())
app.use(cookieParser())
app.use(morgan())
app.use(helmet({
    crossOriginResourcePolicy : false
})) 

const PORT = process.env.PORT || 8080 

app.get("/",(request,response)=>{
    ///server to client
    response.json({
        message : "Server is running " + PORT
    })
})

app.use('/api/user', userRouter)
app.use("/api/category", categoryRouter)
app.use("/api/file", uploadRouter)
app.use("/api/subcategory", subCategoryRouter)
app.use("/api/product", productRouter)
app.use("/api/cart", cartRouter)
app.use("/api/address", addressRouter)
app.use('/api/order', orderRouter)
app.use("/api/banner", bannerRouter)
app.use("/api/admin", adminRouter)
app.use('/api/delivery-boy', deliveryBoyRouter)
app.use("/api/coupon", couponRouter)
app.use("/api/review", reviewRouter)
app.use("/api/notification", notificationRouter)
app.use("/api/festival-offer", festivalOfferRouter)

connectDB().then(()=>{
    if (!process.env.VERCEL) {
        app.listen(PORT,()=>{
            console.log("Server is running",PORT)
            if(process.env.RESEND_API) {
                console.log("RESEND_API is configured");
            } else {
                console.error("RESEND_API IS MISSING! Email features will not work.");
            }
        })
    }
})

export default app

