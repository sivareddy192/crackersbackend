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

subCategorySchema.index({ category: 1, createdAt: -1 });
subCategorySchema.index({ category: 1 });
subCategorySchema.index({ createdAt: -1 });

const subCategoryModel = mongoose.model('subCategory',subCategorySchema)

export default subCategoryModel