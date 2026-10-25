import { Router } from "express";
import auth from "../middleware/auth.js";
import { admin } from "../middleware/Admin.js";
import { 
    addBannerController, 
    deleteBannerController, 
    getBannerController, 
    updateBannerController 
} from "../controllers/banner.controller.js";

const bannerRouter = Router();

bannerRouter.post("/add-banner", auth, admin, addBannerController);
bannerRouter.get("/get", getBannerController);
bannerRouter.put("/update-banner", auth, admin, updateBannerController);
bannerRouter.delete("/delete-banner", auth, admin, deleteBannerController);

export default bannerRouter;
