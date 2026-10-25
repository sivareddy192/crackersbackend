import SubCategoryModel from "../models/subCategory.model.js";

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
    const data = await SubCategoryModel.find()
      .populate("category")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      message: "Subcategory list",
      data,
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

    return res.json({
      message: "Subcategory updated",
      data: updated,
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

export const deleteSubCategoryController = async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({
        message: "Subcategory _id is required",
        error: true,
        success: false
      });
    }

    const deleted = await SubCategoryModel.findByIdAndDelete(_id);

    return res.json({
      message: "Subcategory deleted",
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
