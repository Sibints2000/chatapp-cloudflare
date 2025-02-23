import { Server } from "socket.io";

const users = {}; // Store active users persistently

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log("🚀 Setting up WebSocket server...");

    const io = new Server(res.socket.server, {
      path: "/api/socketio",
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      console.log(`🔵 A user connected: ${socket.id}`);

      socket.on("newUser", (userId) => {
        if (!userId) return;

        users[socket.id] = userId; // Store socket ID → Clerk ID
        console.log("✅ Active Users:", Object.values(users));

        io.emit("activeUsers", Object.values(users)); // Broadcast users list
      });

      socket.on("disconnect", () => {
        console.log(`🔴 A user disconnected: ${socket.id}`);
        delete users[socket.id]; // Remove from list

        console.log("✅ Updated Active Users:", Object.values(users));
        io.emit("activeUsers", Object.values(users)); // Update clients
      });
    });

    res.socket.server.io = io;
  } else {
    console.log("🟢 WebSocket server already running.");
  }

  res.end();
}
