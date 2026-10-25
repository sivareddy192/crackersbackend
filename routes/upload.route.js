import { Router } from 'express'
import auth from '../middleware/auth.js'
import { uploadImageController, uploadVideoController } from '../controllers/uploadImage.controller.js'
import upload from '../middleware/multer.js'

const uploadRouter = Router()

uploadRouter.post("/upload", auth, upload.single("image"), uploadImageController)
uploadRouter.post("/upload-video", auth, upload.single("video"), uploadVideoController)

export default uploadRouter;