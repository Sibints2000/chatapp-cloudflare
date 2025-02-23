export class ChatRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.clients = new Map();
  }

  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response(
        "Invalid request: Only WebSocket connections allowed!",
        { status: 400 }
      );
    }

    const pair = new WebSocketPair();
    const server = pair[1];

    this.clients.set(server, { username: "Guest", imageUrl: null });

    server.addEventListener("message", async (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log("📩 Received message:", message);

        if (message.type === "join") {
          this.clients.set(server, {
            username: message.username,
            imageUrl: message.imageUrl,
          });
          console.log("👤 User joined:", message.username);
          this.broadcastActiveUsers();
        }

        if (message.type === "message") {
          for (const socket of this.clients.keys()) {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify(message));
            }
          }
        }
      } catch (error) {
        console.error("❌ Error handling message:", error);
      }
    });

    server.addEventListener("close", () => {
      console.log("❌ User disconnected");
      this.clients.delete(server);
      this.broadcastActiveUsers();
    });

    return new Response(null, { status: 101, webSocket: server });
  }

  broadcastActiveUsers() {
    const users = Array.from(this.clients.values());
    console.log("👥 Broadcasting active users:", users);
    for (const socket of this.clients.keys()) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "activeUsers", users }));
      }
    }
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      return new Response("Welcome to the Chat App! Use /ws for WebSockets.", {
        headers: { "Content-Type": "text/plain" },
      });
    }

    if (url.pathname === "/ws") {
      const id = env.CHAT_ROOM.idFromName("global_chat");
      const obj = env.CHAT_ROOM.get(id);
      return obj.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  },
};
