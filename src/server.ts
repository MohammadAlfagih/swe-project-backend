import  express  from "express";
import  * as dotenv from "dotenv";
import { registerUser, loginUser } from "./controllers/userControllers"
import connectDB from "./config/DB";
dotenv.config()

connectDB();

const PORT = process.env.PORT || 5000

const app = express()
const router = express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`)
})