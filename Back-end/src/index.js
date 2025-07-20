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

const PORT = process.env.PORT || 8080;
const __dirname = path.resolve();

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? 'https://comuno-chat-app-production.up.railway.app/'
      : 'http://localhost:5173',
    credentials: true,
  })
);


app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Front-end/dist")));

  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, "../Front-end", "dist", "index.html"));
  });
}

console.log("PORT env variable:", process.env.PORT);
console.log("Listening on port:", PORT);

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});


