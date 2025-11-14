import { Router } from "express";
import {login, logout, signup} from "../services/userService.js";

const router = Router();

// 로그인
router.post("/login", async (req, res) => {
  const id = req.body.id;

  if (req.session.user === undefined) {
    const user = await login(id, req.body.password);
    if (user) {

      console.log("user객체 : ", user);
      req.session.user = {
        id: id,
        name: user.userName,
        authorized: true,
      };

      return res.json({
        user : req.session.user
      });
    } else {
      return res.status(401).json({ message: "login fail" });
    }
  }

  // 이미 로그인된 경우(중복 로그인 방지 및 자동 로그인 처리)
  return res.json({
    user: req.session.user
  });
});

// 로그아웃
router.post("/logout", (req, res) => {
  try {
    logout(req.session); // 세션 종료 로직 위임
    res.status(200).json({ message: "로그아웃 성공" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 회원가입
router.post("/signup", async (req, res) => {
  console.log("[DEBUG] /api/users/signup 요청 도착");
  console.log("세션:", req.session);

  const signupObj = req.body;

  // 비밀번호 필드 정리
  signupObj.password = signupObj.pw1;
  delete signupObj.pw1;
  delete signupObj.pw2;

  const result = await signup(signupObj);
  switch (result) {
    case "SUCCESS":
      res.status(201).json({ result: "success" });
      break;
    case "ERR_DUPLICATE":
      res.status(400).json({ result: "duplicate id" });
      break;
    default:
      res.status(500).json({ result: "fail" });
      break;
  }
});

// 로그인 여부 확인 및 사용자 정보 반환
router.get("/user", (req, res) => {
  console.log("[DEBUG] /api/users/user 요청 도착");
  console.log("세션:", req.session);

  // 세션이 없거나 로그인 정보가 없을 경우
  if (!req.session?.user) {
    return res.status(200).json({ user: null });
  }

  // 로그인한 사용자 정보 반환
  return res.status(200).json({ user: req.session.user });
});

export default router;
