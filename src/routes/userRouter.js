import express from "express";
import {
  createUser,
  login,
  updateUserPassword,
  getUserByTask,
  deleteUser,
} from "../controller/userController.js";
const router = express.Router();

router.post("/create", createUser);
router.post("/login", login);
router.post("/updatePassword", updateUserPassword);
router.get("/getUserByTask/:task", getUserByTask);
router.delete("/deleteUser/:id", deleteUser);

export default router;
