import Datastore from "nedb-promises";
import path from "path";
import os from "os";

// This creates a persistent path in the user's home directory
const dbDir = path.join(os.homedir(), "RideShareData");

export const userDB = Datastore.create({
  filename: path.join(dbDir, "users.db"),
  autoload: true
});

export const rideDB = Datastore.create({
  filename: path.join(dbDir, "rides.db"),
  autoload: true
});

const connectDB = async () => {
  console.log(`✅ Local NeDB initialized at: ${dbDir}`);
};

export default connectDB;