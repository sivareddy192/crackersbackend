import CategoryModel from "../models/category.model.js";
import SubCategoryModel from "../models/subCategory.model.js";
import ProductModel from "../models/product.model.js";
import { fastCache, invalidateCategories } from "../utils/fastCache.js";

export const UploadCategoryController = async(req,res)=>{
    try {
        const { name , image } = req.body 

        if(!name || !image){
            return res.status(400).json({
                message : "Enter required fields",
                error : true,
                success : false
            })
        }

        const addCategory = new CategoryModel({
            name,
            image
        })

        const saveCategory = await addCategory.save()

        if(!saveCategory){
            return res.status(500).json({
                message : "Not Created",
                error : true,
                success : false
            })
        }

        invalidateCategories();

        return res.json({
            message : "Added Successfully",
            data : saveCategory,
            success : true,
            error : false
        })

    } catch (error) {
        return res.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getCategoryController = async (req, res) => {
  try {
    return await fastCache.sendCached(req, res, "category:all", async () => {
      const data = await CategoryModel.find().sort({ createdAt: -1 }).lean();
      return {
        data: data,
        error: false,
        success: true
      };
    }, 300);
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false
    });
  }
};

export const updateCategoryController = async (req, res) => {
  try {
    const { _id, name, image } = req.body;

    if (!_id) {
      return res.status(400).json({
        message: "Category _id is required",
        error: true,
        success: false
      });
    }

    const updated = await CategoryModel.findByIdAndUpdate(
      _id,
      { name, image },
      { new: true }
    );

    invalidateCategories();

    return res.json({
      message: "Category updated",
      data: updated,
      success: true,
      error: false
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      error: true,
      success: false
    });
  }
};

export const deleteCategoryController = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({
        message: "Category _id is required",
        error: true,
        success: false
      });
    }

    const subCount = await SubCategoryModel.countDocuments({
      category: { $in: [_id] }
    });

    const prodCount = await ProductModel.countDocuments({
      category: { $in: [_id] }
    });

    if (subCount > 0 || prodCount > 0) {
      return res.status(400).json({
        message: "Category is used in subcategories or products",
        error: true,
        success: false
      });
    }

    const deleted = await CategoryModel.deleteOne({ _id });

    invalidateCategories();

    return res.json({
      message: "Category deleted",
      data: deleted,
      error: false,
      success: true
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true
    });
  }
};