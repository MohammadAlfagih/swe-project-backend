import express from "express";
import { createRide, 
  getOpenRides, 
  bookRide, 
  getMyActiveRide, 
  updateRideStatus } from "../controllers/rideControllers";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Route to get open rides (Anyone can see, or add 'protect' if you want only logged in users to see)
router.get("/", getOpenRides);

// Route to offer a ride (Must be logged in)
router.post("/offer", protect, createRide);
router.put("/book/:id", protect, bookRide); // الراكب يحجز
router.get("/my-active-ride", protect, getMyActiveRide); // السائق يفحص (Polling)
router.put("/status/:id", protect, updateRideStatus); // السائق يبدأ أو ينهي الرحلة
export default router;