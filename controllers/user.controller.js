import sendEmail from '../config/sendEmail.js'
import UserModel from '../models/user.model.js'
import bcryptjs from 'bcryptjs'
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js'
import generatedAccessToken from '../utils/generatatedAccessToken.js'
import generatedRefreshToken from '../utils/generatedRefreshToken.js'
import uploadImageCloudinary from "../utils/uploadImageCloudinary.js"
import forgotPasswordTemplate from '../utils/forgotPasswordTemplate.js'
import generateOtp from '../utils/generateOtp.js'
import jwt from 'jsonwebtoken'
import Coupon from '../models/coupon.model.js'
import welcomeOfferTemplate from '../utils/welcomeOfferTemplate.js'
import ProductModel from '../models/product.model.js'

export async function registerUserController(request,response){
    try {
        const { name, email, password } = request.body

        if (!name || !email || !password) {
            return response.status(400).json({
                message: "provide email, name, password",
                error: true,
                success: false
            })
        }

        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!gmailRegex.test(email)) {
            return response.status(400).json({
                message: "Only Gmail addresses are allowed",
                error: true,
                success: false
            })
        }

        const user = await UserModel.findOne({ email })

        if(user){
            return response.json({
                message : "Already register email",
                error : true,
                success : false
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(password,salt)

        const payload = {
            name,
            email,
            password : hashPassword
        }

        const newUser = new UserModel(payload)
        const save = await newUser.save()

        const frontendOrigin = request.headers.origin || process.env.FRONTEND_URL || "https://tracly.store";
        const VerifyEmailUrl = `${frontendOrigin}/verify-email?code=${save?._id}`

        try {
            await sendEmail({
                sendTo : email,
                subject : "Verify email from Trace",
                html : verifyEmailTemplate({
                    name,
                    url : VerifyEmailUrl
                })
            })
        } catch (emailError) {
            console.error("Registration Email Error:", emailError)
            return response.json({
                message : "User registered successfully, but verification email failed to send.",
                error : false,
                success : true,
                warning : "Email service unavailable",
                data : save
            })
        }

        return response.json({
            message : "User register successfully",
            error : false,
            success : true,
            data : save
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export async function verifyEmailController(request, response) {
    try {
        const code = request.body.code || request.query.code;

        if (!code || code.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(code)) {
            return response.status(400).json({
                message: "Invalid code format",
                error: true,
                success: false
            })
        }

        const user = await UserModel.findOne({ _id: code });

        if (!user) {
            return response.status(400).json({
                message: "Invalid code",
                error: true,
                success: false
            })
        }

        const alreadyVerified = user.verify_email === true;

        const updateUser = await UserModel.findByIdAndUpdate(
            code,
            { verify_email: true },
            { new: true }
        );

        if (!updateUser) {
            return response.status(500).json({
                message: "Failed to verify email",
                error: true,
                success: false
            })
        }

        if (!alreadyVerified) {
            (async () => {
                try {
                    console.log(`[Onboarding Workflow Initiated] Looking up Welcome Offer for verified user: ${user.email}`);

                    let welcomeCoupon = await Coupon.findOne({
                        isFirstOrderOnly: true,
                        isActive: true
                    }).sort({ createdAt: -1 });

                    if (!welcomeCoupon) {
                        console.log("[Onboarding Workflow] No active First-Order coupon found. Auto-seeding 'WELCOME50'...");

                        const existingCode = await Coupon.findOne({ code: 'WELCOME50' });
                        if (existingCode) {
                            existingCode.isActive = true;
                            await existingCode.save();
                            welcomeCoupon = existingCode;
                        } else {
                            welcomeCoupon = new Coupon({
                                code: 'WELCOME50',
                                discountPercent: 50,
                                minAmount: 200,
                                maxDiscount: 100,
                                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                                startDate: new Date(),
                                isFirstOrderOnly: true,
                                usageLimitPerUser: 1,
                                isActive: true
                            });
                            await welcomeCoupon.save();
                        }
                    }

                    let hotDeals = [];
                    try {
                        hotDeals = await ProductModel.find({
                            publish: true,
                            discount: { $gt: 0 }
                        })
                            .sort({ discount: -1 })
                            .limit(3)
                            .lean();
                    } catch (dealErr) {
                        console.error("[Onboarding Workflow Warning] Failed to populate hot deals for onboarding:", dealErr.message);
                    }

                    const shopUrl = process.env.FRONTEND_URL || "https://tracly.store";

                    console.log(`[Onboarding Workflow] Dispatching Email via Resend to: ${user.email} with Coupon: ${welcomeCoupon.code}`);

                    await sendEmail({
                        sendTo: user.email,
                        subject: "🎁 A Special Welcome Offer Just For You!",
                        html: welcomeOfferTemplate({
                            name: user.name,
                            code: welcomeCoupon.code,
                            discountPercent: welcomeCoupon.discountPercent,
                            minAmount: welcomeCoupon.minAmount,
                            maxDiscount: welcomeCoupon.maxDiscount,
                            shopUrl: shopUrl,
                            deals: hotDeals
                        })
                    });

                    console.log(`[Onboarding Workflow] Beautiful Welcome Email dispatched successfully to: ${user.email}`);
                } catch (dispatchErr) {
                    console.error("[Onboarding Workflow Warning] Background Welcome Email dispatch failed:", dispatchErr.message);
                }
            })().catch(bgErr => {
                console.error("[Onboarding Workflow Critical] Unexpected background onboarding failure:", bgErr);
            });
        } else {
            console.log(`[Onboarding Workflow Skipped] User ${user.email} was already verified — no duplicate welcome email sent.`);
        }

        return response.json({
            message: "Verify email done",
            success: true,
            error: false
        })
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function loginController(request,response){
    try {
        const { email , password } = request.body


        if(!email || !password){
            return response.status(400).json({
                message : "provide email, password",
                error : true,
                success : false
            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message : "User not register",
                error : true,
                success : false
            })
        }

        if(user.status !== "Active"){
            return response.status(400).json({
                message : `Your account is ${user.status}. Please contact admin.`,
                error : true,
                success : false
            })
        }

        if(!user.verify_email){
            return response.status(400).json({
                message : "verify your account",
                error : true,
                success : false
            })
        }

        const checkPassword = await bcryptjs.compare(password,user.password)

        if(!checkPassword){
            return response.status(400).json({
                message : "Check your password",
                error : true,
                success : false
            })
        }

        const accesstoken = await generatedAccessToken(user._id)
        const refreshToken = await generatedRefreshToken(user._id)

        const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
            last_login_date : new Date()
        })

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None",
            path : "/"
        }
        response.cookie('accessToken',accesstoken,cookiesOption)
        response.cookie('refreshToken',refreshToken,cookiesOption)

        return response.json({
            message : "Login successfully",
            error : false,
            success : true,
            data : {
                accessToken : accesstoken,
                refreshToken
            }
        })


    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export async function logoutController(request,response){
    try {
        const userid = request.userId

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None",
            path : "/"
        }

        response.clearCookie("accessToken",cookiesOption)
        response.clearCookie("refreshToken",cookiesOption)

        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid,{
            refresh_token : ""
        })

        return response.json({
            message : "Logout successfully",
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


export async  function uploadAvatar(req,res){
    try {
        const userId = req.userId
        const image = req.file

        if (!image) {
            return res.status(400).json({
                message: "Please select an image to upload.",
                success: false,
                error: true
            });
        }

        const upload = await uploadImageCloudinary(image)
        if (!upload) {
            throw new Error("Failed to acquire URL from Cloudinary.");
        }
        
        const updateUser = await UserModel.findByIdAndUpdate(userId, {
            avatar: upload
        }, { new: true })

        return res.json({
            message : "upload profile",
            success : true,
            error : false,
            data : {
                _id : userId,
                avatar : upload
            }
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export async function updateUserDetails(req,res) {
    try{
        const userId =req.userId
        const{name,email,mobile,password} = req.body

        let hashPassword =""

        if(password){
            const salt = await bcryptjs.genSalt(10)
            hashPassword = await bcryptjs.hash(password,salt)
        }
        const updateUser=await UserModel.findByIdAndUpdate(userId,{
            ...(name && {name :name }),
            ...(email && {email :email }),
            ...(mobile && {mobile :mobile }),
            ...(password && {password :hashPassword })
        }, { new: true })
        return res.json({
            message : "Updated Successfully",
            error : false,
            success : true,
            data : updateUser
        })
    }
    catch(error){
        return res.status(500).json({
            message:error.message || error,
            error:true,
            success:false
        })
    }
}

export async function forgotPasswordController(req,res) {
    try {
        const { email } = req.body 

        const user = await UserModel.findOne({ email })

        if(!user){
            return res.status(400).json({
                message : "Email not available",
                error : true,
                success : false
            })
        }

        const otp = generateOtp()
        const expireTime = new Date() + 5 * 60 * 1000

        const update = await UserModel.findByIdAndUpdate(user._id,{
            forgot_password_otp : otp,
            forgot_password_expiry : new Date(expireTime).toISOString()
        })

        await sendEmail({
            sendTo : email,
            subject : "Forgot password from Grow",
            html : forgotPasswordTemplate({
                name : user.name,
                otp : otp
            })
        })

        return res.json({
            message : "check your email",
            error : false,
            success : true
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export async function verifyForgotPasswordOtp(req,res){
    try {
        const { email , otp }  = req.body

        if(!email || !otp){
            return res.status(400).json({
                message : "Provide required field email, otp.",
                error : true,
                success : false
            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return res.status(400).json({
                message : "Email not available",
                error : true,
                success : false
            })
        }

        const currentTime = new Date().toISOString()

        if(user.forgot_password_expiry < currentTime  ){
            return res.status(400).json({
                message : "Otp is expired",
                error : true,
                success : false
            })
        }

        if(otp !== user.forgot_password_otp){
            return res.status(400).json({
                message : "Invalid otp",
                error : true,
                success : false
            })
        }
        const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
            forgot_password_otp : "",
            forgot_password_expiry : ""
        })
        
        return res.json({
            message : "Verify otp successfully",
            error : false,
            success : true
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export async function resetpassword(req,res){
    try {
        const { email , newPassword, confirmPassword } = req.body 

        if(!email || !newPassword || !confirmPassword){
            return res.status(400).json({
                message : "provide required fields email, newPassword, confirmPassword"
            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return res.status(400).json({
                message : "Email is not available",
                error : true,
                success : false
            })
        }

        if(newPassword !== confirmPassword){
            return res.status(400).json({
                message : "newPassword and confirmPassword must be same.",
                error : true,
                success : false,
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(newPassword,salt)

        const update = await UserModel.findOneAndUpdate(user._id,{
            password : hashPassword
        })

        return res.json({
            message : "Password updated successfully.",
            error : false,
            success : true
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export async function refreshToken(req,res){
    try {
        const refreshToken = req.cookies.refreshToken || req?.headers?.authorization?.split(" ")[1]

        if(!refreshToken){
            return res.status(401).json({
                message : "Invalid token",
                error  : true,
                success : false
            })
        }

        const verifyToken = jwt.verify(refreshToken,process.env.SECRET_KEY_REFRESH_TOKEN)


        if(!verifyToken){
            return res.status(401).json({
                message : "token is expired",
                error : true,
                success : false
            })
        }

        const userId = verifyToken?.id

        const user = await UserModel.findById(userId)

        if(!user || user.refresh_token !== refreshToken || user.status !== "Active"){
            if (user && user.status !== "Active") {
                await UserModel.findByIdAndUpdate(userId, { refresh_token: "" })
            }
            return res.status(401).json({
                message : `Your account is ${user?.status}. Please contact admin.`,
                error : true,
                success : false
            })
        }

        const newAccessToken = await generatedAccessToken(userId)

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None",
            path : "/"
        }

        res.cookie('accessToken',newAccessToken,cookiesOption)

        return res.json({
            message : "New Access token generated",
            error : false,
            success : true,
            data : {
                accessToken : newAccessToken
            }
        })


    } catch (error) {
        console.error("Refresh Token Error:", error.message);
        return res.status(401).json({
            message : "Session expired, please login again",
            error : true,
            success : false
        })
    }

}

export async function userDetails(request,response){
    try {
        const userId  = request.userId

        console.log(userId)

        const user = await UserModel.findById(userId).select('-password -refresh_token').lean()

        return response.json({
            message : 'user details',
            data : user,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : "Something is wrong",
            error : true,
            success : false
        })
    }
}

export async function getAllUsers(req, res) {
    try {
        const users = await UserModel.find().select('-password -refresh_token').sort({ createdAt: -1 })

        return res.json({
            message: "All users",
            data: users,
            error: false,
            success: true
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function updateUserRole(req, res) {
    try {
        const { userId, role } = req.body

        if (!userId || !role) {
            return res.status(400).json({
                message: "Provide userId and role",
                error: true,
                success: false
            })
        }

        const update = await UserModel.findByIdAndUpdate(userId, { role }, { new: true })

        return res.json({
            message: "Role updated successfully",
            data: update,
            error: false,
            success: true
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function adminUpdateUser(req, res) {
    try {
        const { userId, name, email, mobile, role, status } = req.body

        if (!userId) {
            return res.status(400).json({
                message: "Provide userId",
                error: true,
                success: false
            })
        }

        const update = await UserModel.findByIdAndUpdate(userId, {
            ...(name && { name }),
            ...(email && { email }),
            ...(mobile && { mobile }),
            ...(role && { role }),
            ...(status && { status }),
            ...(status && status !== "Active" && { refresh_token: "" })
        }, { new: true })

        return res.json({
            message: "User updated successfully",
            data: update,
            error: false,
            success: true
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function deleteUserController(req, res) {
    try {
        const { userId } = req.body

        if (!userId) {
            return res.status(400).json({
                message: "Provide userId",
                error: true,
                success: false
            })
        }

        const deletedUser = await UserModel.findByIdAndDelete(userId)

        if (!deletedUser) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false
            })
        }

        return res.json({
            message: "User deleted successfully",
            error: false,
            success: true
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

export async function requestDeleteController(request, response) {
    try {
        const userId = request.userId;
        const user = await UserModel.findByIdAndUpdate(userId, {
            delete_request: true
        }, { new: true });

        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        return response.json({
            message: "Account deletion request sent to admin panel successfully.",
            success: true,
            error: false
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}
