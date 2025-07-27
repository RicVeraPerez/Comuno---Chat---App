import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.CLIENT_URL
      : 'http://localhost:5173',
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Length", "X-Requested-With"],
    preflightContinue: false,
    maxAge: 3600,
    optionsSuccessStatus: 204,
    handlePreflightRequest: (req, res) => {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": process.env.NODE_ENV === 'production'
          ? process.env.CLIENT_URL
          : "http://localhost:5173",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
      });
      res.end();
    }
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
  allowUpgrades: true,
  upgrade: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});

const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
    socket.userId = userId; // <--- GUARDAMOS el userId dentro del socket
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);

    // Usamos socket.userId en vez de variable externa
    if (socket.userId) {
      delete userSocketMap[socket.userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });

});

export { io, app, server };