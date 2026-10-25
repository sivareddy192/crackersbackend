import { Router } from "express";
import auth from "../middleware/auth.js";
import { addReviewController, getProductReviewsController, getAllReviewsController, updateReviewController, deleteReviewController } from "../controllers/review.controller.js";
import { admin } from "../middleware/Admin.js";

const reviewRouter = Router();

reviewRouter.post("/add", auth, addReviewController);
reviewRouter.get("/get/:productId", getProductReviewsController);
reviewRouter.get("/get-all", auth, admin, getAllReviewsController);
reviewRouter.put("/update", auth, admin, updateReviewController);
reviewRouter.delete("/delete", auth, admin, deleteReviewController);

export default reviewRouter;