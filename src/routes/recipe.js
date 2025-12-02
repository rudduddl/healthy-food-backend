import { Router } from "express";
import {getFavoriteRecipe, getRecipe, putFavoriteRecipe} from "../services/recipeService.js"
const router = Router();

// router.get("/", (req, res) => {
//   res.render("receipe_search");
// });

// router.post("/", async (req, res) => {
//   const search = req.body.name;

//   const receipes = await db.searchReceipe(search);
//   res.render("receipe_search", { receipes: receipes });
// });

// router.post("/how", async (req, res) => {
//   const receipeName = req.body.name;

//   const receipe = await db.getReceipe(receipeName);
//   res.render("receipe", {
//     receipe: receipe,
//   });
// });

// 질환별 상세 레시피 가져오기
router.get("/:recipeId", async (req, res) => {
  const result = await getRecipe(req.params.recipeId);
  console.log("[recipe.js] result : ", result)
  if (result) {
    res.send({ result: "success", recipe: result.recipe, cautionRecipes : result.cautionRecipes});

  } else {
    res.send({result: "상세 레시피 가져오기 실패"});
  }
});

// 즐겨찾기 레시피 들고오기
router.get("/favorite", async (req, res) => {
  const result = await getFavoriteRecipe(req.session.user.id);
  console.log("[recipe.js] 즐겨찾기 result : ", result)
  if (result) {
    res.send({ result: "success"});

  } else {
    res.send({result: "즐겨찾기 레시피 가져오기 실패"});
  }
});
export default router;

// 즐겨찾기에 특정 레시피 추가
router.post("/:recipeId/favorite", async (req, res) => {

    const recipeId = req.params.recipeId; // URL 파라미터로부터 레시피 ID 호출

    if (req.session.user === undefined) {
      res.send({ result: "로그인 후 이용해주세요" });
      return;
    }

    console.log("userId:", req.session.user.id)
    try{
        const modifiedCount = await putFavoriteRecipe(req.session.user.id, recipeId);
        console.log("🚨 Router Received modifiedCount:", modifiedCount, "Type:", typeof modifiedCount);

        if (modifiedCount === 1) {
            console.log("즐겨찾기 성공 응답 전송")
            res.send({ result: "success" });

        } else if (modifiedCount === 0) {
            console.log("즐겨찾기 중복 응답 전송")
            res.send({ result: "이미 즐겨찾기에 추가되어 있습니다." });

        } else {
            // -1 등 알 수 없는 오류
            console.log("즐겨찾기 그 외 오류 전송")
            res.send({ result: "즐겨찾기 추가 실패" });
        }

    } catch (err){
        console.error("recipe 라우터에서 잡힌 오류 : ", err)
        res.send({ result: "즐겨찾기 추가 실패" });
    }

})