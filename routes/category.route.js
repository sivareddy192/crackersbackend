import { Router } from 'express'
import auth from '../middleware/auth.js'
import { deleteCategoryController, getCategoryController, updateCategoryController, UploadCategoryController} from '../controllers/category.controller.js'

const categoryRouter = Router()

categoryRouter.post("/upload-category",auth,UploadCategoryController)
categoryRouter.get('/get',getCategoryController)
categoryRouter.put('/update',auth,updateCategoryController)
categoryRouter.delete("/delete",auth,deleteCategoryController)


export default categoryRouter;