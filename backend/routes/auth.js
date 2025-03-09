import express from "express"
import { loginUser, registerUser } from "../controllers/user.controller.js"

const router = express.Router();

router.get("/register", async (req, res) => {
    registerUser();
});

router.get("/login", async(req, res) => {
    loginUser();
});

module.exports = router;

