import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name : process.env.CLODINARY_CLOUD_NAME,
    api_key : process.env.CLODINARY_API_KEY,
    api_secret : process.env.CLODINARY_API_SECRET_KEY
})

const uploadVideoCloudinary = async(file)=>{
    const buffer = file?.buffer || Buffer.from(await file.arrayBuffer())

    const uploadResult = await new Promise((resolve,reject)=>{
        cloudinary.uploader.upload_stream({ 
            folder : "Tracely/videos",
            resource_type: "video"
        },(error,result)=>{
            if(error) return reject(error)
            return resolve(result)
        }).end(buffer)
    })

    return uploadResult.secure_url
}

export default uploadVideoCloudinary
