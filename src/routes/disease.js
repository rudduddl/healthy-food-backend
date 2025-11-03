import { Router } from "express";
import { searchDisease } from "../services/diseaseService.js";

const router = Router();

router.get("/api/diseases", async (req, res) => {
  try {
    const disease = await searchDisease(req.query.search);
    res.status(200).json(disease);
  } catch (err) {
    console.error("Error in /api/diseases route:", err);
    res.status(500).json({ message : "서버 오류 발생"});
  }

});

export default router;
