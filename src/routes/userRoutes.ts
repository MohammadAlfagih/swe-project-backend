import express from "express";
import { rateUser } from "../controllers/userControllers";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Day 5 Route
router.post("/rate", protect, rateUser);

export default router;