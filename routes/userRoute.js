import {Login, Register} from "../controllers/userController.js"
import express from "express";

const userRouter =express();
userRouter.post("/login", Login);
userRouter.post("/register", Register);

export default userRouter;