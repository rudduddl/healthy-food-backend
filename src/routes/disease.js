import { Router } from "express";
import {getAllDiseases, getCautionByDiseaseId, getDisease, searchDisease} from "../services/diseaseService.js";
import {getRecipe, searchRecipe, putFavoriteRecipe, getCautionRecipesByDisease} from "../services/recipeService.js"

const router = Router();

// 질환 조회
router.get("/", async (req, res) => {
  try {
    const diseases = await getAllDiseases(req.params.data);
    // res.status(200).json(disease);
    res.status(200).json({ success: true, data: diseases });
  } catch (err) {
    console.error("Error in /api/diseases route : ", err);
    res.status(500).json({ message : "서버 오류 발생"});
  }

});

// 특정 질환 조회
router.get("/:diseaseId", async (req, res) => {
  const { diseaseId } = req.params;

  try {
    const disease = await getDisease(diseaseId);
    console.log("성공!!!")
    res.status(200).json({success: true, data: disease});
  } catch (err) {
    console.error("[disease.js] disease id error:", err)
    res.status(500).json({success:false, message: "특정 질병 조회 실패"});
  }
})

// 특정 질환의 주의 음식 조회
router.get("/:diseaseId/caution", async (req, res) => {
  const { diseaseId } = req.params;

  try {
    const caution = await getCautionByDiseaseId(diseaseId);
    res.status(200).json({ success: true, data: caution});
  } catch (err) {
    console.error("[disease.js] caution error:", err);
    res.status(500).json({ success: false, message: "주의 음식 조회 실패" });
  }

});

// 특정 질환의 주의 레시피 조회
router.get("/:diseaseId/caution-recipes", async (req, res) => {
  const { diseaseId } = req.params;

  console.log("DEBUG: req.query 원본 값:", req.query);
  // req.query에서 startIndex와 keyword (search) 파라미터를 추출
  // 프론트엔드에서 보낸 값은 문자열이므로 숫자로 변환
  const startIndex = Number(req.query.startIndex) || 0;
  const keyword = req.query.search || '';

  try {
    const result = await getCautionRecipesByDisease(diseaseId, startIndex, keyword);
    console.log("[disease.js] caution-recipes : ", result.recipes.length, "개, 전체:", result.totalCount);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("[disease.js] caution-recipes error:", err);
    res.status(500).json({ success: false, message: "주의 레시피 조회 실패" });
  }
});

// 질환별 상세 레시피 페이지에서 즐겨찾기 추가
router.post("/:diseaseId/recipes/:recipeId/favorites", async (req, res) => {
  const recipeId = req.params.id; // URL 파라미터로부터 레시피 ID 호출

  if (req.session.user === undefined) {
    res.send({ result: "로그인 후 이용해주세요" });
    return;
  }
  const result = await putFavoriteRecipe(req.session.user.id, recipeId);
  if (result === true) {
    res.send({ result: "success" });
  } else {
    res.send({ result: "즐겨찾기 추가 실패" });
  }
});

// 질환별 레시피 목록에서 검색
router.get("/api/recipes/search", async (req, res) => {
  const searchTerm = req.params.q
  if (searchTerm){
    await searchRecipe(searchTerm)
    res.send(`Searching for: ${searchTerm}`);
  } else {
    res.send('Please provide a search term (e.g., /search?q=example)');
  }

})

export default router;
