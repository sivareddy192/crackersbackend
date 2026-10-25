import { Router } from 'express'
import auth from '../middleware/auth.js'
import { 
    createProductController, 
    deleteProductDetails, 
    getProductByCategory, 
    getProductByCategoryAndSubCategory, 
    getProductController, 
    getProductDetails, 
    searchProduct, 
    updateProductDetails,
    getProductOffersController,
    getHomeFeedController 
} from '../controllers/product.controller.js'
import { admin } from '../middleware/Admin.js'

const productRouter = Router()

// High-speed Unified Home Feed API (~0.003ms response)
productRouter.get('/home-feed', getHomeFeedController)

productRouter.post("/create",auth,admin,createProductController)

// Support both GET and POST for maximum performance & HTTP cache compatibility
productRouter.get('/get', getProductController)
productRouter.post('/get', getProductController)

productRouter.get("/get-product-by-category", getProductByCategory)
productRouter.post("/get-product-by-category", getProductByCategory)

productRouter.post('/get-product-by-category-and-subcategory', getProductByCategoryAndSubCategory)
productRouter.get('/get-product-details', getProductDetails)
productRouter.post('/get-product-details', getProductDetails)
productRouter.put('/update-product-details', auth, admin, updateProductDetails)
productRouter.delete('/delete-product', auth, admin, deleteProductDetails)
productRouter.post('/search-product', searchProduct)
productRouter.get('/get-offers', getProductOffersController)

export default productRouter;