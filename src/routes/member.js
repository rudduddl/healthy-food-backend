import { Router } from "express";
import { login, signup } from "../config/mongodb";

const router = Router();

router.post("/login", async (req, res) => {
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
  res.redirect("/disease");
});

router.post("/logout", (req, res) => {
  if (req.session.user) {
    req.session.destroy(function (err) {
      if (err) {
        console.log("세션 삭제 에러");
        return;
      }
      console.log("세션 삭제 성공");
    });
  }

  res.redirect("/");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signup", async (req, res) => {
  const signupObj = req.body;
  delete signupObj.pswd2;

  const result = await signup(signupObj);
  switch (result) {
    case "SUCCESS":
      res.redirect("/#contact");
      break;
    case "ERR_DUPLICATE":
      res.write("<script>alert('duplicate id')</script>");
      res.write('<script>window.location="signup"</script>');
      break;
    default:
      res.write("<script>alert('fail')</script>");
      res.write('<script>window.location="signup"</script>');
      break;
  }
});

export default router;
