import UserModel from "../models/user.model.js"
import jwt from "jsonwebtoken"
const generatedRefreshToken = async(userId)=>{
    const token = await jwt.sign({id : userId},
        process.env.SECRET_KEY_REFRESH_TOKEN,
        {expiresIn : '8d'}
    )

    const updateRefreshTokenUser =await UserModel.findByIdAndUpdate(
        userId,
        {
            refresh_token :token
        }
    )
    return token
}
export default generatedRefreshToken