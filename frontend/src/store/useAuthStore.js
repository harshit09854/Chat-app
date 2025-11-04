// built with Zustand, is a perfect example of a modern, clean, and efficient state management pattern for a React application. It handles all authentication-related logic and state, centralizing it in one place.
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  // checkAuth: This is the function called from App.jsx. It makes a request to your backend to verify if the user is authenticated. This is a robust way to handle persistence—if the backend confirms the user is logged in, you retrieve their data and set the authUser state. The finally block ensures that isCheckingAuth is always set to false, regardless of success or failure.

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // signup, login, logout, updateProfile: These are the core functions that communicate with your backend's authentication routes. They use axiosInstance to make the API calls, handle loading states, set the authUser upon success, and use react-hot-toast to provide user feedback.

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // Socket.IO Integration: This is a critical part of your code. Instead of creating a socket connection in a component, you handle it directly within the store. The connectSocket and disconnectSocket functions ensure that a socket connection is established as soon as a user is authenticated (checkAuth or login or signup is successful) and disconnected when they log out. This is a very clean and scalable approach.
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));


// The connectSocket function is where your real-time chat functionality begins on the frontend.

// const socket = io(BASE_URL, { query: { userId: authUser._id, }, });: This line establishes the Socket.IO connection. The key here is passing the userId in the query object. This allows the backend to identify the user and manage their socket connection.

// socket.on("getOnlineUsers", (userIds) => { ... });: This is a crucial listener. It waits for the 'getOnlineUsers' event from the server. The server sends this event whenever a user connects or disconnects, providing a real-time list of all online users. Your frontend then updates the onlineUsers state, which would likely be used in your sidebar to show who is currently available.
