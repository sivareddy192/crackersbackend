import mongoose from "mongoose";

const subCategorySchema =new mongoose.Schema({
    name:{
        type:String,
        default :""
    },
    image:{
        type:String,
        default :""
    },
    category:[
        {
            type:mongoose.Schema.ObjectId,
            ref:"category"
        }
    ]
    
    
},{
    timestamps:true
})

// Speed up sub-category by category group queries
subCategorySchema.index({ category: 1 });

const subCategoryModel = mongoose.model('subCategory',subCategorySchema)

export default subCategoryModel