import  express  from "express";
import  * as dotenv from "dotenv";
import { registerUser, loginUser } from "./controllers/userControllers"
dotenv.config()
const PORT = process.env.PORT

const app = express()
const router = express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`)
})