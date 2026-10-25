import { Router } from 'express'
import {userDetails,resetpassword,refreshToken,verifyForgotPasswordOtp,forgotPasswordController,loginController, updateUserDetails, registerUserController,uploadAvatar,verifyEmailController, logoutController, getAllUsers, updateUserRole, adminUpdateUser, deleteUserController, requestDeleteController} from '../controllers/user.controller.js'
import auth from '../middleware/auth.js'
import upload from '../middleware/multer.js'
import { admin } from '../middleware/Admin.js'

const userRouter =Router()

userRouter.post('/register',registerUserController),
userRouter.post('/verify-email',verifyEmailController),
userRouter.post('/login',loginController)
userRouter.post('/logout',auth,logoutController)
userRouter.put('/upload-avatar',auth,upload.single('avatar'),uploadAvatar)
userRouter.put('/update-user',auth,updateUserDetails)
userRouter.put('/forgot-password',forgotPasswordController)
userRouter.put('/verify-forgot-password-otp',verifyForgotPasswordOtp)
userRouter.put('/reset-password',resetpassword)
userRouter.post('/refresh-token',refreshToken) 
userRouter.get('/details',auth,userDetails)
userRouter.put('/request-delete',auth,requestDeleteController)

// Admin management
userRouter.get('/all-users', auth, admin, getAllUsers)
userRouter.put('/update-role', auth, admin, updateUserRole)
userRouter.put('/admin-update-user', auth, admin, adminUpdateUser)
userRouter.delete('/delete-user', auth, admin, deleteUserController)

export default userRouter;