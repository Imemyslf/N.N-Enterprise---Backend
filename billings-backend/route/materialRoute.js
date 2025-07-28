import express from "express";
import { getMaterailDetails, searchMaterial, insertMaterial, updateMaterial, deleteMaterialByName, deleteAllMaterial, sortMaterial} from "../controllers/materialControllers.js";

const router = express.Router();

router.get("/", getMaterailDetails);
router.get("/search/:name",searchMaterial);
router.get("/sort",sortMaterial);
router.post("/insert",insertMaterial);
router.put("/update",updateMaterial);
router.delete("/delete/:name", deleteMaterialByName);
router.delete("/delete", deleteAllMaterial);

export default router;