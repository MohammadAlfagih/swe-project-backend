import express from "express";
import { registerUser, loginUser, getUserProfile } from "../controllers/userControllers";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// تعريف المسارات
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

export default router;