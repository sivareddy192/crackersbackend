import mongoose from "mongoose";

const festivalOfferSchema = new mongoose.Schema({
    title : {
        type : String,
        default : ""
    },
    subTitle : {
        type : String,
        default : ""
    },
    image : {
        type : String,
        default : ""
    },
    discountPercent : {
        type : Number,
        default : 0
    },
    couponCode : {
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

const FestivalOfferModel = mongoose.model('festivalOffer', festivalOfferSchema)

export default FestivalOfferModel
