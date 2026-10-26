import jwt from 'jsonwebtoken'
import UserModel from '../models/user.model.js'

const auth = async(request,response,next)=>{
    try {
        const token = request.cookies.accessToken || request?.headers?.authorization?.split(" ")[1]
       
        if(!token){
            return response.status(401).json({
                message : "You have not login"
            })
        }

        const decode = jwt.verify(token,process.env.SECRET_KEY_ACCESS_TOKEN)

        if(!decode){
            return response.status(401).json({
                message : "unauthorized access",
                error : true,
                success : false
            })
        }


        request.userId = decode.id

        const user = await UserModel.findById(decode.id).select('status')
        if (!user || user.status !== "Active") {
            return response.status(401).json({
                message: `Your account is ${user?.status || 'Inactive'}. Please contact admin.`,
                error: true,
                success: false,
                forceLogout: true
            })
        }

        next()

    } catch (error) {
        return response.status(401).json({
            message : "Session expired, please login again",
            error : true,
            success : false
        })
    }
}

export default auth