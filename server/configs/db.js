import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("Database already connected");
      return;
    }

    if (mongoose.connection.readyState === 2) {
      console.log("Database is connecting...");
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database Connected");
  } catch (error) {
    console.error("DB connection error:", error.message);
  }
};

export default connectDB;
