import { Router } from "express";
import { searchDisease } from "../config/mongodb";

const router = Router();

router.get("/", async (req, res) => {
  const disease = await searchDisease(req.query.search);
  res.render("next", { disease: disease });
});

export default router;
