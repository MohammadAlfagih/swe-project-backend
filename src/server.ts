import * as dotenv from "dotenv"
import connectDB from './config/DB'
import app from "./app"

dotenv.config()

connectDB()

const PORT = process.env.PORT || 5000

app.listen(PORT,()=> {
  console.log(`Server is running on ${PORT}`)
})