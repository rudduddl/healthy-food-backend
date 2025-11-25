import { Router } from "express";
import {getFavoriteRecipe, getRecipe} from "../services/recipeService.js"
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
  const result = await getRecipe(req.params.id);
  if (result === true) {
    res.send({ result: "success"});

  } else {
    res.send({result: "상세 레시피 가져오기 실패"});
  }
});

// 즐겨찾기 레시피 들고오기
router.get("/api/recipes/favorite", async (req, res) => {
  const result = await getFavoriteRecipe(req.session.user.id);
  if (result === true) {
    res.send({ result: "success"});

  } else {
    res.send({result: "즐겨찾기 레시피 가져오기 실패"});
  }
});
export default router;