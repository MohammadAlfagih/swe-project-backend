import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

const {hash, compare} = bcrypt
const { sign } = jwt

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isDriver: boolean;
  rating: number;
  numReviews: number; 
  generateJWT(): Promise<string>;
  comparePassword(enteredpassword: string): Promise<boolean>;
}

const UserSchema = new Schema ({
  name : {type : String, required:true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isDriver :{type: Boolean, default:true},
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
})

UserSchema.pre("save", async function (this: IUser) {
  if (this.isModified("password")) {
    this.password = await hash(this.password, 10);
  }
});

UserSchema.methods.generateJWT = async function () {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  return sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

UserSchema.methods.comparePassword = async function (enteredpassword: string) {
  return await compare(enteredpassword, this.password);
};

const User = model<IUser>("User", UserSchema);

export default User;