// This code creates a standard web server. All regular HTTP requests (like fetching a list of messages) go through this app and server

import { Server } from "socket.io";
import http from "http";
import express from "express";
const app = express();
const server = http.createServer(app);
 
// This line "hires" the Socket.IO manager (io). It tells the manager to use the same server and allows people from your frontend's address (http://localhost:5173) to enter the chat room.
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}






// io.on("connection", ...): This is the "welcome" event. Whenever a new person (a client) connects, the manager listens. The socket object represents that one person's connection.
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);
  
  // const userId = ...: This is how the manager identifies the new person. It asks for their userId, which you sent from the frontend.
  const userId = socket.handshake.query.userId;
  // userSocketMap[userId] = socket.id: The manager writes the person's name and seat number on its clipboard.
  if (userId) userSocketMap[userId] = socket.id;
  
  // io.emit() is used to send events to all the connected clients
  // io.emit("getOnlineUsers", ...): This is the manager's announcement. When someone new comes in, it shouts to everyone in the room, "Here's an updated list of who is here!" The frontend listens for this announcement and updates the green dots next to user names.
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  
  // socket.on("disconnect", ...): This is the "goodbye" event. When a person leaves the room, the manager removes their name from the clipboard and makes another announcement to everyone that the list of online users has changed.
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };


// Express and HTTP Server: express is like the building itself, and http is the front door.

// Socket.IO (io): The io object is the chat room manager. Its job is to manage everyone who comes into the room and what they do.

// The userSocketMap: This is the manager's clipboard. When someone enters the room, they write their name and their seat number on it. The name is their userId and the seat number is their socket.id. This clipboard lets the manager know exactly where to send a private message (e.g., "Hey, a new message for a user at seat number 234!").