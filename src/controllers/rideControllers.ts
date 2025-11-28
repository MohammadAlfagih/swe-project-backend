import { Request, Response } from "express";
import Ride from "../models/Ride";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * @desc    Driver offers a ride
 * @route   POST /api/rides/offer
 * @access  Private (Driver only)
 */
export const createRide = async (req: AuthRequest, res: Response) => {
  try {
    const { from, to, startTime } = req.body;

    if (!from || !to || !startTime) {
      return res.status(400).json({ message: "Please provide from, to, and startTime" });
    }

    // Since default isDriver is true, everyone can create a ride.
    // We get the user ID from the token (middleware)
    const ride = await Ride.create({
      driver: req.user._id,
      from,
      to,
      startTime,
      status: "open",
    });

    res.status(201).json({
      success: true,
      ride,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Get all open rides
 * @route   GET /api/rides
 * @access  Public (or Private, depending on preference. Usually Private in apps)
 */
export const getOpenRides = async (req: Request, res: Response) => {
  try {
    // Find rides where status is 'open'
    // .populate('driver', 'name') replaces the ID with the actual driver's name
    const rides = await Ride.find({ status: "open" })
      .populate("driver", "name email")
      .sort({ startTime: 1 }); // Sort by soonest rides

    res.status(200).json(rides);
  } catch (error: any) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Passenger books a ride
 * @route   PUT /api/rides/book/:id
 */
export const bookRide = async (req: AuthRequest, res: Response) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status !== "open") {
      return res.status(400).json({ message: "Ride is no longer available" });
    }

    // تحديث الرحلة: إضافة الراكب وتغيير الحالة إلى pending
    ride.passenger = req.user._id;
    ride.status = "booked"; // أو "pending" حسب التسمية التي تفضلها
    await ride.save();

    res.status(200).json({ success: true, ride });
  } catch (error: any) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Driver gets their active ride (Polling)
 * @route   GET /api/rides/my-active-ride
 */
export const getMyActiveRide = async (req: AuthRequest, res: Response) => {
  try {
    // نبحث عن رحلة لهذا السائق حالتها ليست مكتملة أو ملغية
    const ride = await Ride.findOne({
  $or: [{ driver: req.user._id }, { passenger: req.user._id }], // Check both
  status: { $in: ["open", "booked", "ongoing"] },
}).populate("driver", "name email rating").populate("passenger", "name email"); 

    if (!ride) {
      return res.status(200).json(null); // لا توجد رحلة نشطة
    }

    res.status(200).json(ride);
  } catch (error: any) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Driver updates status (Accept -> ongoing, End -> completed)
 * @route   PUT /api/rides/status/:id
 */
export const updateRideStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body; // "ongoing" or "completed"
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // تأكد أن السائق هو مالك الرحلة
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    ride.status = status;
    await ride.save();

    res.status(200).json({ success: true, ride });
  } catch (error: any) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};