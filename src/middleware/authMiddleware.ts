import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

// واجهة مخصصة عشان نقدر نضيف بيانات المستخدم للـ Request
export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  // 1. التأكد من وجود التوكن في الهيدر (Authorization)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // استخراج التوكن (حذف كلمة Bearer)
      token = req.headers.authorization.split(" ")[1];

      // 2. فك التشفير
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

      // 3. جلب بيانات المستخدم وإضافتها للطلب (بدون الباسورد)
      req.user = await User.findById(decoded.id).select("-password");

      next(); // التوكن سليم، انتقل للفنكشن التالية
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};