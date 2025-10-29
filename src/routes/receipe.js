import { Router } from "express";
import { favoriteReciepe } from "../config/mongodb";

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

router.post("/favorite", async (req, res) => {
  const receipeName = req.body.name;

  if (req.session.user === undefined) {
    res.send({ result: "로그인 후 이용해주세요" });
    return;
  }
  const result = await favoriteReciepe(req.session.user.id, receipeName);
  if (result === true) {
    res.send({ result: "success" });
  } else {
    res.send({ result: "즐겨찾기 추가 실패" });
  }
});
export default router;
