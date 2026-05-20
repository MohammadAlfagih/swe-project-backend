import  express  from "express";
import cors from "cors"
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes";
import rideRoutes from "./routes/rideRoutes";
import userRoutes from "./routes/userRoutes";


const app = express()

// Security middleware (Non-functional Requirements)

app.use(helmet())

// Rate limiting 100 req per 15 min

const limiter = rateLimit({
  windowMs: 15*60 *1000,
  max: process.env.NODE_ENV === "test" ? 5 : 100,
  message:"Too many requests, try againg later"
})
app.use(limiter)

// Standard middileware

app.use(cors())
app.use(express.json())

// Health cheack for test pipline

app.get("/health", (req,res) => {
  res.status(200).json({status:"OK"})
})

app.use("/api/auth", authRoutes)
app.use("/api/rides", rideRoutes)
app.use("/api/users", userRoutes)

export default app;