const express = require("express");
const { register, loginUser, getMe } = require("../controllers/auth.controller");
const authenticate = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/register",register);
router.post("/login", loginUser);
router.get("/me", authenticate, getMe);


module.exports = router;