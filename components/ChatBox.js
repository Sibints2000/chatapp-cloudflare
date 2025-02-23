import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Messages from "./Messages";
import SendInput from "./SendInput";
import Topbar from "./Topbar";

export default function Chat({ socket }) {
  const { user, isSignedIn } = useUser();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket) {
      const ws = new WebSocket("wss://nextjs-chat-app.bornspy.workers.dev/ws");
      window.socket = ws;
      console.log("🔗 WebSocket initialized:", ws);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log("📩 Received message:", msg);

        if (msg.sender === user?.id) return;

        if (msg.type === "message") {
          setMessages((prev) => [...prev, msg]);
        }
      } catch (error) {
        console.error("⚠️ Error parsing WebSocket message:", error);
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, user?.id]);

  const sendMessage = () => {
    if (!message.trim() || !socket || socket.readyState !== WebSocket.OPEN) {
      console.error("❌ WebSocket is not open or message is empty.");
      return;
    }

    const msgData = {
      type: "message",
      sender: user?.id || "Anonymous",
      text: message,
    };

    socket.send(JSON.stringify(msgData));
    console.log("📤 Sending message:", msgData);

    setMessages((prev) => [...prev, { sender: "You", text: message }]);
    setMessage("");
  };

  if (!isSignedIn) return <p>Loading...</p>;

  return (
    <div className="flex items-center justify-center bg-white">
      <div className="mx-auto w-full max-w-full py-4 bg-white">
        <Topbar
          userImage={user?.imageUrl}
          username={user?.username || user?.firstName || "Guest"}
        />
        <div className="md:h-[680px] h-[650px] overflow-y-auto bg-white p-2 md:mx-0 mx-2 rounded mb-4">
          {messages.map((msg, index) => (
            <Messages key={index} msg={msg} />
          ))}
        </div>
        <SendInput
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
        />
      </div>
    </div>
  );
}
