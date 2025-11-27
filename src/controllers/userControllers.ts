import { Request, Response } from "express";
import User from "../models/User"; 
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, isDriver } = req.body;

    // 1. Validate basic input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 3. Create User
    // Note: The .pre('save') hook in The model will handle password hashing
    const user = await User.create({
      name,
      email,
      password,
      isDriver: isDriver || false,
    });

    // 4. Generate Token using your instance method
    const token = await user.generateJWT();

    // 5. Respond
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isDriver: user.isDriver,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // 2. Find user in DB
    const user = await User.findOne({ email });

    // 3. Check if user exists AND password matches
    // We use the comparePassword method defined in your interface
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. Generate Token
    const token = await user.generateJWT();

    // 5. Respond
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isDriver: user.isDriver,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
/**
 * @desc    Get user profile (Test Token)
 * @route   GET /api/auth/profile
 * @access  Private (Requires Token)
 */
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  // إذا وصلنا هنا، يعني أن التوكن سليم والـ Middleware مرر الطلب
  res.status(200).json({
    message: "Success! Token is valid.",
    user: req.user, // بيانات المستخدم التي استخرجناها من التوكن
  });
};