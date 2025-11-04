import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);


router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

export default router;


// Explanation of message.route.js
// This file, built with Express.js Router, organizes all the routes for your messaging functionality. It's a clean way to separate your API endpoints and their corresponding logic.

// Key Functions:
// Route Definitions: You've defined three key API endpoints:

// router.get("/users", protectRoute, getUsersForSidebar);: This is an API endpoint that, when a GET request is made to /api/messages/users, will execute the getUsersForSidebar function from your message.controller.js. This is likely what your frontend uses to display the list of all users in the sidebar.

// router.get("/:id", protectRoute, getMessages);: This route handles fetching messages for a specific conversation. The :id is a route parameter that represents the ID of the other user in the conversation. When a GET request is made, it calls the getMessages function.

// router.post("/send/:id", protectRoute, sendMessage);: This route handles sending a new message. It expects a POST request to the specified user ID, and it will execute the sendMessage function.

// protectRoute Middleware: This is the most important part of this file from a security perspective.

// You've correctly used protectRoute as middleware on all your message-related routes.

// This middleware's job is to check if the incoming request has a valid JWT token (which it reads from the cookie using cookieParser).

// If the token is valid, the request proceeds to the next function (getUsersForSidebar, getMessages, or sendMessage).

// If the token is missing or invalid, the middleware will immediately stop the request and send an error response (e.g., a 401 Unauthorized), preventing unauthenticated users from accessing your data.

// This file shows a solid understanding of Express routing and middleware. By separating your routes into a dedicated file and using middleware to protect them, you've built a secure and well-organized backend.