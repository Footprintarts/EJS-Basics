import express from "express";
import bcrypt from "bcrypt";
import User from "../models/user.mjs";

const router = express.Router();

// Register
router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.redirect("/login");
  } catch (err) {
    res.redirect("/register");
  }
});

// Login
router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.userId = user._id;
    res.redirect("/chat");
  } else {
    res.redirect("/login");
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

export default router;
