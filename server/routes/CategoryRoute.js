import express from "express";
import {
    activeInactive,
    createCategory,
    deleteCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,

} from "../controllers/categoryController.js";
import { protect, restrictTo } from "../middlewares/authUser.js";

const router = express.Router();

router.post("/", protect, restrictTo('admin'), createCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.put("/:id", protect, restrictTo('admin'), updateCategory);
router.delete("/:id", protect, restrictTo('admin'), deleteCategory);
router.patch('/status/:categoryId', protect, restrictTo('admin'), activeInactive);


export default router;
