import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
};


// Explanation of db.js
// This file is responsible for establishing the connection between your Node.js backend and your MongoDB database.

// Key Functions
// mongoose.connect(process.env.MONGODB_URI): This is the core function call that initiates the connection.

// mongoose: This is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides a straightforward, schema-based solution to model your application data, which you've used in your User.model.js and Message.model.js files.

// process.env.MONGODB_URI: This is a best practice for managing sensitive information. You've stored your database connection string in a .env file, which keeps it out of your source code and ensures it remains secure, especially when pushing to a public repository like GitHub.

// try...catch Block: The code is wrapped in a try...catch block, which is essential for robust error handling. If the database connection fails for any reason (e.g., wrong URI, network issues), it will catch the error and log it, preventing your server from crashing and helping with debugging.

// Confirmation Message: The console.log message confirms that the connection was successful and tells you which host you're connected to, which is helpful for verifying that everything is working as expected during development and deployment.