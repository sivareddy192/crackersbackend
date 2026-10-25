import ProductModel from "../models/product.model.js";
import BannerModel from "../models/banner.model.js";
import CategoryModel from "../models/category.model.js";
import SubCategoryModel from "../models/subCategory.model.js";
import FestivalOfferModel from "../models/festivalOffer.model.js";
import Coupon from "../models/coupon.model.js";
import sendEmail from "../config/sendEmail.js";
import UserModel from "../models/user.model.js";
import productOfferEmailTemplate from "../utils/productOfferEmailTemplate.js";
import { fastCache, invalidateProducts } from "../utils/fastCache.js";

const calculateDiscountPercent = (mrp, price) => {
    const originalPrice = Number(mrp);
    const sellingPrice = Number(price);

    if (!Number.isFinite(originalPrice) || !Number.isFinite(sellingPrice) || originalPrice <= 0) {
        return 0;
    }

    return Math.min(100, Math.max(0, Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)));
};

export const createProductController = async(request,response)=>{
    try {
        const { 
            name ,
            image ,
            category,
            subCategory,
            unit,
            stock,
            price,
            mrp,
            description,
            more_details,
            variants,
            relatedProducts,
            video,
        } = request.body 

        const requiredFields = { name, image, category, subCategory, unit, price, description };
        const missingFields = Object.keys(requiredFields).filter(key => {
            const val = requiredFields[key];
            if (Array.isArray(val)) return val.length === 0;
            return !val;
        });

        if (missingFields.length > 0) {
            return response.status(400).json({
                message: `Missing required fields: ${missingFields.join(", ")}`,
                error: true,
                success: false
            });
        }

        const product = new ProductModel({
            name ,
            image ,
            category,
            subCategory,
            unit,
            stock,
            price,
            mrp,
            discount: calculateDiscountPercent(mrp, price),
            description,
            more_details,
            variants: Array.isArray(variants) ? variants.map(variant => ({
                ...variant,
                discount: calculateDiscountPercent(variant.mrp, variant.price)
            })) : [],
            relatedProducts,
            video,
        })
        const saveProduct = await product.save()

        // Invalidate product caches immediately
        invalidateProducts();

        // AUTO-BROADCAST FOR NEW PRODUCTS WITH DISCOUNTS
        if (saveProduct.publish && saveProduct.discount > 0) {
            (async () => {
                try {
                    const users = await UserModel.find(
                        { email: { $regex: /@gmail\.com$/i } }, 
                        "name email"
                    );

                    if (!users.length) return;

                    const shopUrl = process.env.FRONTEND_URL || "https://tracly.store";
                    
                    const productSlug = saveProduct.name
                        .toLowerCase()
                        .trim()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/[\s_-]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                        
                    const targetProductUrl = `${shopUrl}/product/${productSlug}-${saveProduct._id}`;
                    const imageUrl = (saveProduct.image && saveProduct.image[0]) || "";

                    console.log(`[Product-Broadcast] Dispatching new discounted item: '${saveProduct.name}' to ${users.length} users.`);
                    
                    for (const user of users) {
                        try {
                            await new Promise(resolve => setTimeout(resolve, 250));

                            const html = productOfferEmailTemplate({
                                name: user.name,
                                productName: saveProduct.name,
                                productImage: imageUrl,
                                discountPercent: saveProduct.discount,
                                price: saveProduct.price,
                                mrp: saveProduct.mrp || saveProduct.price,
                                unit: saveProduct.unit,
                                productUrl: targetProductUrl
                            });

                            await sendEmail({
                                sendTo: user.email,
                                subject: `🔥 New Offer: ${saveProduct.name} is now ${saveProduct.discount}% OFF!`,
                                html: html
                            });
                        } catch (dispatchErr) {
                            // Quiet fail single recipients to sustain main loop
                        }
                    }
                    console.log(`[Product-Broadcast] Success: Email blast for '${saveProduct.name}' complete.`);
                } catch (blastErr) {
                    console.error("[Product-Broadcast Warning] Async background loop failed:", blastErr.message);
                }
            })().catch(critBgErr => console.error("[Product-Broadcast Warning] Critical background exception:", critBgErr));
        }

        return response.json({
            message : "Product Created Successfully",
            data : saveProduct,
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

export const getProductController = async(request,response)=>{
    try {
        let { page, limit, search } = request.body || {};

        if(!page) page = 1;
        if(!limit) limit = 10;

        const cacheKey = `product:list:${page}:${limit}:${search || ''}`;

        return await fastCache.sendCached(request, response, cacheKey, async () => {
            const query = search
              ? {
                  $or: [
                    { name: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                    { more_details: { $regex: search, $options: "i" } }
                  ]
                }
              : {};

            const skip = (page - 1) * limit;

            const [data, totalCount] = await Promise.all([
                ProductModel.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate('category subCategory')
                    .lean(),

                ProductModel.countDocuments(query)
            ]);

            return {
                message : "Product data",
                error : false,
                success : true,
                totalCount : totalCount,
                totalNoPage : Math.ceil(totalCount / limit),
                data : data
            };
        }, 120);

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductByCategory = async(request,response)=>{
    try {
        const id = request.body?.id || request.query?.id || request.params?.id;

        if(!id){
            return response.status(400).json({
                message : "provide category id",
                error : true,
                success : false
            })
        }

        const cacheKey = `product:category:${id}`;

        return await fastCache.sendCached(request, response, cacheKey, async () => {
            const product = await ProductModel.find({ 
                category : { $in : id },
                publish : true
            }).sort({ createdAt: -1 }).limit(15).lean();

            return {
                message : "category product list",
                data : product,
                error : false,
                success : true
            };
        }, 300);

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductByCategoryAndSubCategory  = async(request,response)=>{
    try {
        const { categoryId, subCategoryId } = request.body || {};
        let { page, limit } = request.body || {};

        if (!categoryId || !subCategoryId) {
            return response.status(400).json({
                message: "Provide categoryId and subCategoryId",
                error: true,
                success: false
            });
        }

        const mongoose = await import('mongoose');
        if (!mongoose.Types.ObjectId.isValid(categoryId) || !mongoose.Types.ObjectId.isValid(subCategoryId)) {
            return response.status(400).json({
                message: "Invalid Category or SubCategory ID",
                error: true,
                success: false
            });
        }

        if(!page) page = 1;
        if(!limit) limit = 10;

        const cacheKey = `product:cat_sub:${categoryId}:${subCategoryId}:${page}:${limit}`;

        return await fastCache.sendCached(request, response, cacheKey, async () => {
            const query = {
                category : { $in : categoryId },
                subCategory : { $in : subCategoryId }
            };

            const skip = (page - 1) * limit;

            const [data, dataCount] = await Promise.all([
                ProductModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
                ProductModel.countDocuments(query)
            ]);

            return {
                message : "Product list",
                data : data,
                totalCount : dataCount,
                page : page,
                limit : limit,
                success : true,
                error : false
            };
        }, 300);

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductDetails = async(request,response)=>{
    try {
        const productId = request.body?.productId || request.query?.productId || request.params?.productId;

        if (!productId) {
            return response.status(400).json({
                message: "Provide productId",
                error: true,
                success: false
            });
        }

        const cacheKey = `product:detail:${productId}`;

        return await fastCache.sendCached(request, response, cacheKey, async () => {
            const product = await ProductModel.findOne({ _id : productId })
                .populate('category subCategory relatedProducts')
                .lean();

            return {
                message : "product details",
                data : product,
                error : false,
                success : true
            };
        }, 300);

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// Update product
export const updateProductDetails = async(request,response)=>{
    try {
        const { _id } = request.body 

        if(!_id){
            return response.status(400).json({
                message : "provide product _id",
                error : true,
                success : false
            })
        }

        const oldProduct = await ProductModel.findById(_id);
        if (!oldProduct) {
            return response.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }

        const update = { ...request.body };
        if (Object.hasOwn(update, "mrp") || Object.hasOwn(update, "price")) {
            update.discount = calculateDiscountPercent(update.mrp ?? oldProduct.mrp, update.price ?? oldProduct.price);
        }
        if (Array.isArray(update.variants)) {
            update.variants = update.variants.map(variant => ({
                ...variant,
                discount: calculateDiscountPercent(variant.mrp, variant.price)
            }));
        }

        const updatedProduct = await ProductModel.findByIdAndUpdate(_id, update, { new: true });

        // Invalidate all product caches
        invalidateProducts();

        // AUTO-BROADCAST IF AN OFFER WAS ADDED OR NEWLY PUBLISHED WITH A DISCOUNT
        const isOfferAdded = (!oldProduct.discount || oldProduct.discount <= 0) && updatedProduct.discount > 0;
        const isPublishedNowWithDiscount = !oldProduct.publish && updatedProduct.publish && updatedProduct.discount > 0;

        if (updatedProduct.publish && (isOfferAdded || isPublishedNowWithDiscount)) {
            (async () => {
                try {
                    const users = await UserModel.find(
                        { email: { $regex: /@gmail\.com$/i } }, 
                        "name email"
                    );

                    if (!users.length) return;

                    const shopUrl = process.env.FRONTEND_URL || "https://tracly.store";
                    
                    const productSlug = updatedProduct.name
                        .toLowerCase()
                        .trim()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/[\s_-]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                        
                    const targetProductUrl = `${shopUrl}/product/${productSlug}-${updatedProduct._id}`;
                    const imageUrl = (updatedProduct.image && updatedProduct.image[0]) || "";

                    console.log(`[Product-Broadcast] Dispatching updated/new discounted item: '${updatedProduct.name}' to ${users.length} users.`);
                    
                    for (const user of users) {
                        try {
                            await new Promise(resolve => setTimeout(resolve, 250));

                            const html = productOfferEmailTemplate({
                                name: user.name,
                                productName: updatedProduct.name,
                                productImage: imageUrl,
                                discountPercent: updatedProduct.discount,
                                price: updatedProduct.price,
                                mrp: updatedProduct.mrp || updatedProduct.price,
                                unit: updatedProduct.unit,
                                productUrl: targetProductUrl
                            });

                            await sendEmail({
                                sendTo: user.email,
                                subject: `🔥 New Offer: ${updatedProduct.name} is now ${updatedProduct.discount}% OFF!`,
                                html: html
                            });
                        } catch (dispatchErr) {
                            // Quiet fail single recipients to sustain main loop
                        }
                    }
                    console.log(`[Product-Broadcast] Success: Email blast for '${updatedProduct.name}' complete.`);
                } catch (blastErr) {
                    console.error("[Product-Broadcast Warning] Async background loop failed:", blastErr.message);
                }
            })().catch(critBgErr => console.error("[Product-Broadcast Warning] Critical background exception:", critBgErr));
        }

        return response.json({
            message : "updated successfully",
            data : updatedProduct,
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

// Delete product
export const deleteProductDetails = async(request,response)=>{
    try {
        const { _id } = request.body 

        if(!_id){
            return response.status(400).json({
                message : "provide _id ",
                error : true,
                success : false
            })
        }

        const deleteProduct = await ProductModel.deleteOne({_id : _id });

        // Invalidate all product caches
        invalidateProducts();

        return response.json({
            message : "Delete successfully",
            error : false,
            success : true,
            data : deleteProduct
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// Search products
export const searchProduct = async(request,response)=>{
    try {
        let { search, page, limit, categoryIds, minPrice, maxPrice, sort, offersOnly } = request.body || {};

        if(!page) page = 1;
        if(!limit) limit = 10;

        const query = {
            publish: true
        };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { more_details: { $regex: search, $options: "i" } }
            ];
        }

        if (Array.isArray(categoryIds) && categoryIds.length) {
            query.category = { $in: categoryIds };
        }

        const priceFilter = {};
        const minimumPrice = Number(minPrice);
        const maximumPrice = Number(maxPrice);
        if (minPrice !== undefined && minPrice !== "" && Number.isFinite(minimumPrice)) {
            priceFilter.$gte = minimumPrice;
        }
        if (maxPrice !== undefined && maxPrice !== "" && Number.isFinite(maximumPrice)) {
            priceFilter.$lte = maximumPrice;
        }
        if (Object.keys(priceFilter).length) {
            query.price = priceFilter;
        }

        if (offersOnly) {
            query.discount = { $gt: 0 };
        }

        const sortOptions = {
            featured: { createdAt: -1 },
            newest: { createdAt: -1 },
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            offers: { discount: -1, createdAt: -1 }
        };
        const sortBy = Object.prototype.hasOwnProperty.call(sortOptions, sort)
            ? sortOptions[sort]
            : sortOptions.featured;

        const skip = ( page - 1) * limit;

        const [data,dataCount] = await Promise.all([
            ProductModel.find(query)
                .sort(sortBy)
                .skip(skip)
                .limit(limit)
                .populate('category subCategory')
                .lean(),

            ProductModel.countDocuments(query)
        ]);

        return response.json({
            message : "Product data",
            error : false,
            success : true,
            data : data,
            totalCount : dataCount,
            totalPage : Math.ceil(dataCount / limit),
            page : page,
            limit : limit 
        });

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

// Get top active product deals / offers
export const getProductOffersController = async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 6;
        const cacheKey = `product:offers:${limit}`;

        return await fastCache.sendCached(req, res, cacheKey, async () => {
            const deals = await ProductModel.find({
                publish: true,
                discount: { $gt: 0 }
            })
            .sort({ discount: -1 })
            .limit(limit)
            .populate('category subCategory')
            .lean();

            return {
                message: "Dynamic discounted deals loaded.",
                success: true,
                error: false,
                data: deals
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

// High-Speed Unified Home Feed API (~0.003ms RAM response)
export const getHomeFeedController = async (req, res) => {
    try {
        return await fastCache.sendCached(req, res, "home:feed", async () => {
            const [banners, categories, subCategories, festivalOffers, welcomeCoupon, featuredProducts] = await Promise.all([
                BannerModel.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
                CategoryModel.find().sort({ createdAt: -1 }).lean(),
                SubCategoryModel.find().populate('category').sort({ createdAt: -1 }).lean(),
                FestivalOfferModel.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
                Coupon.findOne({ isFirstOrderOnly: true, isActive: true, expiryDate: { $gt: new Date() } }).lean(),
                ProductModel.find({ publish: true })
                    .sort({ createdAt: -1 })
                    .limit(24)
                    .populate('category subCategory')
                    .lean()
            ]);

            return {
                message: "Home feed loaded",
                error: false,
                success: true,
                data: {
                    banners,
                    categories,
                    subCategories,
                    festivalOffers,
                    welcomeCoupon,
                    featuredProducts
                }
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
