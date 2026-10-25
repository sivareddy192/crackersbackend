import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    name : {
        type : String,
        default : ""
    },
    imageDesktop : {
        type : String,
        default : ""
    },
    imageMobile : {
        type : String,
        default : ""
    },
    isActive : {
        type : Boolean,
        default : true
    },
    link : {
        type : String,
        default : ""
    }
},{
    timestamps : true
})

const BannerModel = mongoose.model('banner',bannerSchema)

export default BannerModel
