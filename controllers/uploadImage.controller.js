import uploadImageCloudinary from "../utils/uploadImageCloudinary.js"
import uploadVideoCloudinary from "../utils/uploadVideoCloudinary.js"

export const uploadImageController = async(req,res)=>{
    try {
        const file = req.file

        const uploadImage = await uploadImageCloudinary(file)
        
        return res.json({
            message:"upload Done",
            data:uploadImage,
            error:false,
            success:true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    } 
}

export const uploadVideoController = async(req,res)=>{
    try {
        const file = req.file

        if(!file){
            return res.status(400).json({
                message : "Provide video file",
                error : true,
                success : false
            })
        }

        const uploadVideo = await uploadVideoCloudinary(file)
        
        return res.json({
            message:"Video Uploaded Successfully",
            data:uploadVideo,
            error:false,
            success:true
        })
    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    } 
}

export default uploadImageController