import { Router } from "express";
import {getAllDiseases, getDisease, searchDisease} from "../services/diseaseService.js";
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

// 특정 질환의 주의 음식 조회

// 특정 질환의 주의 레시피 조회
router.get("/:diseaseId/caution-recipes", async (req, res) => {
  const { diseaseId } = req.params;

  try {
    const recipes = await getCautionRecipesByDisease(diseaseId);
    res.status(200).json({ success: true, data: recipes });
  } catch (err) {
    console.error("[disease.js] caution-recipes error:", err);
    res.status(500).json({ success: false, message: "주의 레시피 조회 실패" });
  }
});

// 질환별 상세 레시피 가져오기
router.get("/:diseaseId/recipes/:recipeId", async (req, res) => {
  const result = await getRecipe(req.params.id);
  if (result === true) {
    res.send({ result: "success"});

  } else {
    res.send({result: "상세 레시피 가져오기 실패"});
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
