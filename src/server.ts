import  express  from "express";
import  * as dotenv from "dotenv";
import cors from "cors"
import { registerUser, loginUser,getUserProfile } from "./controllers/userControllers"
import { protect } from "./middleware/authMiddleware"; 
import connectDB from "./config/DB";
dotenv.config()

connectDB();

const PORT = process.env.PORT || 5000

const app = express()


app.use(cors())
app.use(express.json());
const router = express.Router();


router.post('/register', registerUser);
router.post('/login', loginUser);

app.use('/api/auth', router);

router.get('/profile', protect, getUserProfile);
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`)
})