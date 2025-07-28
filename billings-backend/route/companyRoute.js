import express from "express";
import { getCompanyDetails, searchCompany, insertCompany, deleteCompanyByName, deleteAllCompany, sortCompany, updateCompany } from "../controllers/companyController.js";

const router = express.Router();

router.get("/",getCompanyDetails);
router.get("/search/:name",searchCompany);
router.get("/sort",sortCompany);
router.post("/insert",insertCompany);
router.put("/update",updateCompany);
router.delete("/delete/:name",deleteCompanyByName);
router.delete("/delete",deleteAllCompany);


export default router;