import SubCategoryModel from "../models/subCategory.model.js";
import ProductModel from "../models/product.model.js";
import { fastCache, invalidateSubCategories, invalidateProducts } from "../utils/fastCache.js";

export const UpdatedSubCategoryController = async (req, res) => {
  try {
    const { name, image, category } = req.body;

    if (!name || !image || !category || !category.length) {
      return res.status(400).json({
        message: "Name, image and category are required",
        error: true,
        success: false
      });
    }

    const sub = new SubCategoryModel({ name, image, category });
    const saved = await sub.save();

    invalidateSubCategories();

    return res.json({
      message: "Subcategory created",
      data: saved,
      success: true,
      error: false
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true
    });
  }
};

export const getSubCategoryController = async (req, res) => {
  try {
    return await fastCache.sendCached(req, res, "subcategory:all", async () => {
      const data = await SubCategoryModel.find()
        .populate("category")
        .sort({ createdAt: -1 })
        .lean();

      const cleaned = data.map((sub) => ({
        ...sub,
        category: (sub.category || []).filter(Boolean),
      }));

      return {
        message: "Subcategory list",
        data: cleaned,
        success: true,
        error: false
      };
    }, 300);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true
    });
  }
};

export const updateSubCategoryController = async (req, res) => {
  try {
    const { _id, name, image, category } = req.body;

    if (!_id) {
      return res.status(400).json({
        message: "Subcategory _id is required",
        error: true,
        success: false
      });
    }

    const updated = await SubCategoryModel.findByIdAndUpdate(
      _id,
      { name, image, category },
      { new: true }
    );

    invalidateSubCategories();

    return res.json({
      message: "Subcategory updated",
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

export const deleteSubCategoryController = async (req, res) => {
  try {
    const _id = req.body?._id || req.query?._id || req.body?.id || req.query?.id || req.params?.id;

    if (!_id) {
      return res.status(400).json({
        message: "Subcategory _id is required",
        error: true,
        success: false
      });
    }

    // Unlink this subcategory from any products
    await ProductModel.updateMany({ subCategory: _id }, { $pull: { subCategory: _id } });

    const deleted = await SubCategoryModel.findByIdAndDelete(_id);
    if (!deleted) {
      await SubCategoryModel.deleteOne({ _id });
    }

    invalidateSubCategories();
    invalidateProducts();

    return res.json({
      message: "Subcategory deleted successfully",
      data: deleted,
      success: true,
      error: false
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
      error: true
    });
  }
};
