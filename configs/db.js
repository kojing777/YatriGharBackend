import mongoose from "mongoose";


const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log("MongoDB connect vo muji !");
    });
    await mongoose.connect(`${process.env.MONGODB_URI}/yatrighar`);
  } catch (error) {
    console.error(error.message);
    
  }
}

export default connectDB;
