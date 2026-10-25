import mongoose from "mongoose";
import CartProductModel from "../models/cartproduct.model.js";
import UserModel from "../models/user.model.js";

export const addToCartItemController = async(request,response)=>{
    try {
        const userId = request.userId
        const { productId, unit } = request.body
        
        if(!productId){
            return response.status(402).json({
                message : "Provide productId",
                error : true,
                success : false
            })
        }

        const query = {
            userId: userId,
            productId: productId,
            unit: unit || ""
        };

        const existingItem = await CartProductModel.findOne(query).lean();

        if (existingItem) {
            return response.json({
                message: "Item already in cart",
                error: false,
                success: true,
                data: existingItem
            });
        }

        const save = await CartProductModel.findOneAndUpdate(
            query, 
            { 
                $setOnInsert: { 
                    quantity: 1, 
                    userId: userId, 
                    productId: productId, 
                    unit: unit || "" 
                } 
            }, 
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        await UserModel.updateOne(
            { _id: userId, shopping_cart: { $ne: save._id } }, 
            { $addToSet: { shopping_cart: save._id } }
        );

        return response.json({
            data: save,
            message: "Item add successfully",
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message : error.message || "Internal Server Error",
            error : true,
            success : false,
        })
    }
}

export const getCartItemController = async(request,response)=>{
    try {
        const userId = request.userId

        // Add select on productId to only fetch required fields for faster populate
        const cartItem = await CartProductModel.find({
            userId : userId
        })
        .sort({ createdAt: -1 })
        .populate({
            path: 'productId',
            select: 'name image category subCategory unit stock price mrp discount description variants publish'
        })
        .lean()

        const validItems = cartItem.filter(item => item.productId && item.productId.publish !== false);

        return response.json({
            data : validItems,
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const updateCartItemQtyController = async (request, response) => {
    try {
        const userId = request.userId 
        const { _id, qty } = request.body

        if (!_id || qty == null) {
            return response.status(400).json({
                message: "Provide _id and qty",
                success: false
            })
        }

        const cartItem = await CartProductModel.findOne({ 
            _id, 
            userId 
        }).populate({
            path: "productId",
            select: "stock variants unit"
        })

        if (!cartItem) {
            return response.status(404).json({
                message: "Cart item not found",
                success: false
            })
        }

        const stock = cartItem.productId?.stock ?? 0

        if (stock === 0) {
            await CartProductModel.deleteOne({ _id })
            return response.status(410).json({
                message: "Out of stock",
                code: "OUT_OF_STOCK",
                success: false
            })
        }

        if (qty > stock) {
            return response.status(409).json({
                message: "Max stock reached",
                maxStock: stock,
                code: "MAX_STOCK_REACHED",
                success: false
            })
        }

        const update = await CartProductModel.updateOne(
            { _id, userId },
            { quantity: qty }
        )

        return response.json({
            message: "Cart updated",
            success: true,
            data: update
        })

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            success: false
        })
    }
}


export const deleteCartItemQtyController = async(request,response)=>{
    try {
      const userId = request.userId
      const { _id } = request.body 
      
      if(!_id){
        return response.status(400).json({
            message : "Provide _id",
            error : true,
            success : false
        })
      }

      const deleteCartItem  = await CartProductModel.deleteOne({_id : _id, userId : userId })

      return response.json({
        message : "Item remove",
        error : false,
        success : true,
        data : deleteCartItem
      })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}