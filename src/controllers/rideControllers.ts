import { Request, Response } from "express";
import { rideDB, userDB } from "../config/DB";
import { AuthRequest } from "../middleware/authMiddleware";

// Interface to help with manual population
interface RideDoc {
  _id: string;
  driver: string;
  passenger?: string;
  from: string;
  to: string;
  status: string;
  startTime: Date;
}

export const createRide = async (req: AuthRequest, res: Response) => {
  try {
    const { from, to, startTime } = req.body;

    // Fix the "possibly undefined" error by checking req.user first
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    if (!from || !to || !startTime) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    const ride = await rideDB.insert({
      driver: req.user._id,
      from,
      to,
      startTime,
      status: "open",
    });

    res.status(201).json({ success: true, ride });
  } catch (error: any) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getOpenRides = async (req: Request, res: Response) => {
  try {
    const rides = (await rideDB.find({ status: "open" }).sort({ startTime: 1 })) as RideDoc[];

    // Manual Population for Driver
    const populatedRides = await Promise.all(rides.map(async (ride) => {
      const driver = await userDB.findOne({ _id: ride.driver }, { password: 0 });
      return { ...ride, driver };
    }));

    res.status(200).json(populatedRides);
  } catch (error: any) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const bookRide = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    
    const ride = await rideDB.findOne({ _id: req.params.id }) as RideDoc | null;

    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.status !== "open") return res.status(400).json({ message: "Not available" });

    // NeDB uses .update, not .save()
    await rideDB.update(
      { _id: req.params.id },
      { $set: { passenger: req.user._id, status: "booked" } }
    );

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getMyActiveRide = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const ride = await rideDB.findOne({
      $or: [{ driver: req.user._id }, { passenger: req.user._id }],
      status: { $in: ["open", "booked", "ongoing"] },
    }) as RideDoc | null;

    if (!ride) return res.status(200).json(null);

    // Manual population for both Driver and Passenger
    const driver = await userDB.findOne({ _id: ride.driver }, { password: 0 });
    const passenger = ride.passenger ? await userDB.findOne({ _id: ride.passenger }, { password: 0 }) : null;

    res.status(200).json({ ...ride, driver, passenger });
  } catch (error: any) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateRideStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!req.user) return res.status(401).json({ message: "Not authorized" });

    const ride = await rideDB.findOne({ _id: req.params.id }) as RideDoc | null;

    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.driver !== req.user._id) return res.status(401).json({ message: "Not authorized" });

    await rideDB.update({ _id: req.params.id }, { $set: { status } });

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};