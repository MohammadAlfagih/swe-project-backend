import  express  from "express";
import  * as dotenv from "dotenv";
import cors from "cors"
import authRoutes from "./routes/authRoutes";
import rideRoutes from "./routes/rideRoutes";
import userRoutes from "./routes/userRoutes";
import connectDB from "./config/DB";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
dotenv.config()

connectDB();

const PORT = process.env.PORT || 5000

const app = express()


//-------------------------------------
// Extra Layer of Protection (Security)
//-------------------------------------


//This is 15 Middleware to make  http response headers 
//It hides headers to help obscure the technology stack
//enforces X-Frame-Options to prevent Clickjacking
// and implements basic Content-Security-Policy to mitigate XSS attacks
app.use(helmet())


// This is Api limiter based on IP, each ip has a max of 100 requests each 15 minutes
// it help preventing DoS and DDoS attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message:{message: "Too many requests from this ip, Try agian after 15 minutes"},
  standardHeaders: true,legacyHeaders: false,
})

app.use('/api/',apiLimiter)


app.use(cors())
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/rides', rideRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`)
})