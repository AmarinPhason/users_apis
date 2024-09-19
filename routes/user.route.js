import express from "express";
import {
  deleteMyAccountCtrl,
  deleteUserByIdCtrl,
  forgotPasswordCtrl,
  getAllUsersCtrl,
  getMyProfileCtrl,
  getUserByIdCtrl,
  loginCtrl,
  logoutCtrl,
  registerCtrl,
  resetPasswordCtrl,
  updateProfileCtrl,
} from "../controllers/users.controller.js";
import {
  adminMiddleware,
  authMiddleware,
} from "../middlewares/authMiddleware.js";
import { singleUpload } from "../utils/multer.js";
const userRouter = express.Router();
// methods GET
userRouter.get("/all-users", authMiddleware, adminMiddleware, getAllUsersCtrl);
userRouter.get("/my-profile", authMiddleware, getMyProfileCtrl);
userRouter.get("/user/:id", authMiddleware, getUserByIdCtrl);

// methods POST
userRouter.post("/register", registerCtrl);
userRouter.post("/login", loginCtrl);
userRouter.post("/logout", logoutCtrl);
userRouter.post("/forgot-password", forgotPasswordCtrl);

// methods PUT
userRouter.put(
  "/update-profile",
  authMiddleware,
  singleUpload,
  updateProfileCtrl
);
userRouter.put("/reset-password/:token", resetPasswordCtrl);
// methods DELETE
userRouter.delete(
  "/delete-user/:id",
  authMiddleware,
  adminMiddleware,
  deleteUserByIdCtrl
);

userRouter.delete("/delete-account", authMiddleware, deleteMyAccountCtrl);
export default userRouter;
