import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), 'Back-end/.env') }); // adjust path if needed
import cookieParser from "cookie-parser";
import cors from "cors";


import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";



const PORT = process.env.PORT || 8080;
const __dirname = path.resolve();

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.CLIENT_URL
      : 'http://localhost:5173',
    credentials: true,
  })
);


app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);


console.log("PORT env variable:", process.env.PORT);
console.log("Listening on port:", PORT);

server.listen(PORT, () => {
  console.log('MONGODB_URI:', process.env.MONGODB_URI);
  console.log("server is running on PORT:" + PORT);
  connectDB();
});


