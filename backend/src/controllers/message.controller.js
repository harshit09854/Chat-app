import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// getUsersForSidebar
// Purpose: This function is called when a logged-in user wants to see a list of other users to chat with.
// Logic:
// const loggedInUserId = req.user._id;: The protectRoute middleware has already attached the logged-in user's data to the req object. This line safely extracts their _id.
// await User.find({ _id: { $ne: loggedInUserId } }).select("-password");: This is a MongoDB query using Mongoose. It finds all users whose _id is not equal to ($ne) the logged-in user's _id. The .select("-password") is a security measure that ensures you don't send sensitive user passwords to the frontend.
// res.status(200).json(filteredUsers);: The list of users is sent back to the frontend.
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// getMessages
// Purpose: This function fetches the conversation history between two users.
// Logic:
// const { id: userToChatId } = req.params;: It extracts the other user's ID from the URL parameter.
// const messages = await Message.find({ $or: [...] });: This is a powerful MongoDB query. It uses the $or operator to find all messages where either:
// The sender is the logged-in user and the receiver is the other user.
// OR the sender is the other user and the receiver is the logged-in user.
// The fetched messages are then sent to the frontend.

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


// sendMessage
// Purpose: This is the most complex and important function, as it handles a message being sent and broadcasts it in real-time.
// Logic:
// Data Extraction: It gets the message text/image, the receiver's ID from the URL, and the sender's ID from the req.user object.
// Image Upload: The if (image) block shows you've implemented an optional image upload feature. It uses the cloudinary library to upload a base64-encoded image and gets the URL for storage.
// Database Storage: A new Message document is created with the sender, receiver, and message content. await newMessage.save(); ensures the message is permanently stored in the database.

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    
    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }
    
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });
    
    await newMessage.save();
    
    // Real-time Broadcast: This is where the magic happens.
    // const receiverSocketId = getReceiverSocketId(receiverId);: It calls the function we reviewed in socket.js to get the unique socket.id of the receiver.
    // if (receiverSocketId) { io.to(receiverSocketId).emit("newMessage", newMessage); }: This is the private messaging functionality. io.to(receiverSocketId) targets a specific socket (your receiver), and .emit("newMessage", ...) sends the new message to them instantly.
    // res.status(201).json(newMessage);: A 201 Created status is sent back to the sender's frontend to confirm the message was successfully processed.
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
