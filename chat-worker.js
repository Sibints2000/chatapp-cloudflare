export class ChatRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.clients = new Set(); // Use Set for connected clients
    this.userData = new Map(); // Store user info separately
  }

  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response(
        "Invalid request: Only WebSocket connections allowed!",
        { status: 400 }
      );
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    server.accept();
    this.clients.add(server);
    this.userData.set(server, { username: "Guest", imageUrl: null });

    console.log("🔗 New WebSocket connection established!");

    server.addEventListener("message", async (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("📩 Received message:", message);

        if (message.type === "join") {
          this.userData.set(server, {
            username: message.username,
            imageUrl: message.imageUrl,
          });
          console.log(`👤 User joined: ${message.username}`);
          this.broadcastActiveUsers();
        } else if (message.type === "message") {
          this.broadcastMessage(message);
        }
      } catch (error) {
        console.error("❌ Error handling message:", error);
      }
    });

    server.addEventListener("close", () => {
      console.log("❌ User disconnected");
      this.clients.delete(server);
      this.userData.delete(server);
      this.broadcastActiveUsers();
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  broadcastMessage(message) {
    console.log("📢 Broadcasting message:", message);
    for (const socket of this.clients) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
      }
    }
  }

  broadcastActiveUsers() {
    const users = Array.from(this.userData.values());
    console.log("👥 Broadcasting active users:", users);
    for (const socket of this.clients) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "activeUsers", users }));
      }
    }
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/ws") {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected WebSocket upgrade", { status: 426 });
      }

      const id = env.CHAT_ROOM.idFromName("global_chat");
      const obj = env.CHAT_ROOM.get(id);
      return obj.fetch(request);
    }

    return new Response("Welcome to the Chat App! Use /ws for WebSockets.", {
      headers: { "Content-Type": "text/plain" },
    });
  },
};
