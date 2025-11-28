import  express  from "express";
import  * as dotenv from "dotenv";
import cors from "cors"
import authRoutes from "./routes/authRoutes";
import rideRoutes from "./routes/rideRoutes";
import userRoutes from "./routes/userRoutes";
import connectDB from "./config/DB";
dotenv.config()

connectDB();

const PORT = process.env.PORT || 5000

const app = express()


app.use(cors())
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/rides', rideRoutes);
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`)
})