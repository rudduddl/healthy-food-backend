import { Router } from "express";
import { getAllCategories, getCategory } from "../services/categoryService.js";

const router = Router();

// 모든 카테고리 목록 조회
router.get("/", async (req, res) => {
    try {
        const categories = await getAllCategories();

        console.log("category 조회 data : ", categories)
        res.status(200).json({ success: true, data: categories });
    } catch (err) {
        console.error("Error in /api/categories route : ", err);
        res.status(500).json({ success: false, message: "서버 오류 발생" });
    }
});

// 특정 카테고리 상세 조회 (Slug 기준)
router.get("/:categorySlug", async (req, res) => {
    const { categorySlug } = req.params;
    console.log("categorySlug : ", req.params);

    try {
        const category = await getCategory(categorySlug);

        console.log("특정 category 조회 data : ", category)

        if (!category) {
            return res.status(404).json({ success: false, message: "해당 카테고리를 찾을 수 없습니다." });
        }

        res.status(200).json({ success: true, data: category });
    } catch (err) {
        console.error("Error in /api/categories/:categorySlug route : ", err);
        res.status(500).json({ success: false, message: "서버 오류 발생" });
    }
});

export default router;