import { Router } from "express";
import {login, logout, signup} from "../services/userService.js";

const router = Router();

// 로그인
router.post("/api/members/login", async (req, res) => {
  const id = req.body.id;
  const password = req.body.password;
  
  if (req.session.user === undefined) {
    const user = await login(id, password);
    if (user) {
      req.session.user = {
        id: id,
        password: password,
        name: user.name,
        authorized: true,
      };
    } else {
      res.write("<script>alert('login fail')</script>");
      res.write('<script>window.location="/"</script>');
      return;
    }
  }
  res.redirect("/api/diseases");
});

// 로그아웃
router.post("/api/members/logout", (req, res) => {
  try {
    logout(req.session); // 세션 종료 로직 위임
    res.status(200).json({ message: "로그아웃 성공" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 회원가입
router.post("/api/members/signup", async (req, res) => {
  const signupObj = req.body;
  delete signupObj.pswd2;

  const result = await signup(signupObj);
  switch (result) {
    case "SUCCESS":
      res.json({ result: "success" });
      break;
    case "ERR_DUPLICATE":
      res.status(400).json({ result: "duplicate id" });
      break;
    default:
      res.status(500).json({ result: "fail" });
      break;
  }
});

export default router;
