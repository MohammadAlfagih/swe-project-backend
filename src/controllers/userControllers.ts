import { Request, Response } from "express";
// import User from "../models/User"; 
// import { AuthRequest } from "../middleware/authMiddleware";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { userDB } from "../config/DB";

// /**
//  * @desc    Register a new user
//  * @route   POST /api/auth/register
//  * @access  Public
//  */
interface UserDoc {
  _id: string;
  name: string;
  email: string;
  password?: string;
  isDriver: boolean;
  rating: number;
  numReviews: number;
}
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: "30d" });
};
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, isDriver } = req.body;
    // 1. Validate basic input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    // 2. Check if user already exists
    // const userExists = await User.findOne({ email });
    const userExists = await userDB.findOne({ email }) as UserDoc | null;
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 3. Create User
    // Note: The .pre('save') hook in The model will handle password hashing
    const hashedPassword = await bcrypt.hash(password,10)

    // const user = await User.create({
    //   name,
    //   email,
    //   password,
    //   isDriver: isDriver || false,
    // });
    const newUser = await userDB.insert({
      name,
      email,
      password:hashedPassword,
      isDriver: isDriver !== undefined ? isDriver : true,
      rating:0,
      numReviews:0,
    }) as UserDoc;

    // 4. Generate Token using your instance method
    // const token = await user.generateJWT();

    // 5. Respond
    res.status(201).json({
      success: true,
      token: generateToken(newUser._id),
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isDriver: newUser.isDriver,
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
    // const user = await User.findOne({ email });
    const user = await userDB.findOne({ email }) as UserDoc | null;

    // 3. Check if user exists AND password matches
    // We use the comparePassword method defined in your interface
    // if (!user || !(await user.comparePassword(password))) {
    //   return res.status(401).json({ message: "Invalid email or password" });
    // }
    if(user && user.password && (await bcrypt.compare(password, user.password))){
      res.json({
        success:true,
        token: generateToken(user._id),
        user: {_id:user._id,name:user.name,email:user.email,isDriver:user.isDriver}
      })
    }else{
      res.status(401).json({message:"invalid email or password"})
    }

    // 4. Generate Token
    // const token = await user.generateJWT();

    // 5. Respond
    // res.status(200).json({
    //   success: true,
    //   token,
    //   user: {
    //     _id: user._id,
    //     name: user.name,
    //     email: user.email,
    //     isDriver: user.isDriver,
    //   },
    // });
  } catch (error: any) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
/**
 * @desc    Get user profile (Test Token)
 * @route   GET /api/auth/profile
 * @access  Private (Requires Token)
 */
// export const getUserProfile = async (req: AuthRequest, res: Response) => {
//   // إذا وصلنا هنا، يعني أن التوكن سليم والـ Middleware مرر الطلب
//   res.status(200).json({
//     message: "Success! Token is valid.",
//     user: req.user, // بيانات المستخدم التي استخرجناها من التوكن
//   });
// };
export const rateUser = async (req: any, res: Response) => {
  try {
    const { userId, rating } = req.body; // userId هو معرف السائق

    // const userToRate = await User.findById(userId);
    const userToRate = await userDB.findOne({_id:userId}) as UserDoc | null;

    if (!userToRate) {
      return res.status(404).json({ message: "User not found" });
    }

    // معادلة حساب المتوسط التراكمي
    // (التقييم القديم * عدد المقيمين + التقييم الجديد) / (عدد المقيمين + 1)
    const currentTotal = userToRate.rating * userToRate.numReviews;
    // const newTotalRating = ((currentTotal + Number(rating)) / (userToRate.numReviews + 1));

    // userToRate.rating = parseFloat(newTotalRating.toFixed(1)); // تقريب لرقم عشري واحد
    // userToRate.numReviews += 1;
    const newNumReviews = userToRate.numReviews + 1
    const newAvg = parseFloat(((currentTotal + Number(rating) /newNumReviews).toFixed(1)))

    // await userToRate.save();
    await userDB.update(
      { _id: userId },
      { 
        $set: { 
          rating: newAvg, 
          numReviews: newNumReviews 
        } 
      }
    );

    res.status(200).json({ success: true, message: "Rating submitted" });
  } catch (error: any) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
export const getUserProfile = async (req: any, res: Response) => {
  if (!req.user) return res.status(404).json({ message: "User not found" });
  res.status(200).json({
    message: "Success!",
    user: req.user,
  });
};