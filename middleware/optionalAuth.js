import jwt from 'jsonwebtoken'
import UserModel from '../models/user.model.js'

const optionalAuth = async(request,response,next)=>{
    try {
        const token = request.cookies.accessToken || request?.headers?.authorization?.split(" ")[1]
       
        if(!token){
            request.userId = null;
            return next();
        }

        const decode = jwt.verify(token,process.env.SECRET_KEY_ACCESS_TOKEN)

        if(!decode){
            request.userId = null;
            return next();
        }

        request.userId = decode.id

        // Check if user status is active
        const user = await UserModel.findById(decode.id).select('status')
        if (user && user.status !== "Active") {
            request.userId = null;
        }

        next()

    } catch (error) {
        request.userId = null;
        next()
    }
}

export default optionalAuth
