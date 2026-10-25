import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name : process.env.CLODINARY_CLOUD_NAME,
    api_key : process.env.CLODINARY_API_KEY,
    api_secret : process.env.CLODINARY_API_SECRET_KEY
})

const uploadImageCloudinary = async(image)=>{
    if (!image) throw new Error("No file provided to uploadImageCloudinary");
    const buffer = image.buffer || Buffer.from(await image.arrayBuffer());

    const uploadImage = await new Promise((resolve,reject)=>{
        cloudinary.uploader.upload_stream({ folder : "Tracely"},(error,uploadResult)=>{
            if (error) return reject(error);
            return resolve(uploadResult);
        }).end(buffer)
    })

    return uploadImage.secure_url || uploadImage.url;
}

export default uploadImageCloudinary
