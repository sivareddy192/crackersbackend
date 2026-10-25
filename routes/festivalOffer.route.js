import { Router } from "express";
import auth from "../middleware/auth.js";
import { admin } from "../middleware/Admin.js";
import { 
    addFestivalOfferController, 
    getFestivalOfferController, 
    updateFestivalOfferController, 
    deleteFestivalOfferController,
    sendFestivalOfferBlastController
} from "../controllers/festivalOffer.controller.js";

const festivalOfferRouter = Router();

festivalOfferRouter.post("/add", auth, admin, addFestivalOfferController);
festivalOfferRouter.get("/get", getFestivalOfferController);
festivalOfferRouter.put("/update", auth, admin, updateFestivalOfferController);
festivalOfferRouter.delete("/delete", auth, admin, deleteFestivalOfferController);
festivalOfferRouter.post("/send-blast", auth, admin, sendFestivalOfferBlastController);

export default festivalOfferRouter;
