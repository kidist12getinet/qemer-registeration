const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const dbURL = process.env.MONGODB_URI ;
    
    const conn = await mongoose.connect(dbURL);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;