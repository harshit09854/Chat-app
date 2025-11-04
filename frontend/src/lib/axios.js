import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5001/api"
      : "/api",
  withCredentials: true,
});

// This file is a configuration file for Axios, a popular library for making HTTP requests. By creating a custom axiosInstance, you're establishing a single, reusable point of configuration for all API calls in your frontend.

// Key Functions:
// Base URL: The baseURL is dynamically set based on the environment (development or production). This is a best practice, as it allows your application to work seamlessly in both a local development environment and a deployed production environment without manual changes. When developing locally, it points to http://localhost:5001/api. In production, it points to /api, which means it will use the same domain as the deployed frontend.

// withCredentials: true: This is an extremely important line for a full-stack application. It tells Axios to include cookies in the API requests. This is how your frontend sends the JWT (or session cookie) back to the backend. Without this line, your auth.middleware.js on the backend would fail to authenticate the user because no credentials would be sent with the request.
