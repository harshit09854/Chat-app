import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

// express.json(): This middleware is crucial for parsing incoming JSON requests. Without it, your server wouldn't be able to read the data sent from the frontend during signup, login, or when sending messages.
app.use(express.json());
// cookieParser(): This parses cookies attached to incoming requests. This is what allows your server to read the JWT or session token sent by the client, which is essential for your checkAuth and other protected routes.
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Production Build Handling: The if (process.env.NODE_ENV === "production") block is vital for deployment. When your application is in production, this code serves your frontend's static build files (../frontend/dist). The app.get("*", ...) route acts as a catch-all, ensuring that any unhandled request is sent to the index.html file, which is necessary for a Single-Page Application (SPA) like yours.

// Server Listening: The server.listen() method is the final step that starts your server and makes it ready to accept incoming requests. You've also correctly placed connectDB() inside the callback, ensuring the database connection is established only after the server has successfully started.

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
