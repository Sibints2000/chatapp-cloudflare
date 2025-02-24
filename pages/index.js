import { useEffect, useState } from "react";
import { useUser, SignIn } from "@clerk/nextjs";
import Chat from "@/components/ChatBox";
import NavTopbar from "@/components/NavTopbar";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  const { isSignedIn, user } = useUser();
  const [activeUsers, setActiveUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!isSignedIn || !user) return;

    const ws = new WebSocket("wss://nextjs-chat-app.bornspy.workers.dev/ws");
    setSocket(ws);

    ws.onopen = () => {
      console.log("✅ Connected to WebSocket server");

      // Send user details when connecting
      ws.send(
        JSON.stringify({
          type: "join",
          username: user.fullName || user.emailAddresses[0].emailAddress, // Use full name or email
          imageUrl: user.imageUrl, // Send profile image
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 WebSocket Message Received:", data); // ✅ Debug all messages

      if (data.type === "activeUsers") {
        setActiveUsers(data.users);
        console.log("👥 Active Users Updated:", data.users);
      }
    };

    return () => ws.close();
  }, [isSignedIn, user]);

  console.log("user", user);

  return (
    <div className="flex flex-col h-screen">
      {!isSignedIn ? (
        <div className="flex items-center justify-center h-full">
          <SignIn routing="hash" />
        </div>
      ) : (
        <>
          <NavTopbar />
          <div className="flex flex-grow">
            <div className="hidden md:block md:w-80 lg:w-96">
              <div className="border border-gray-200 rounded-md m-4 h-[90vh]">
                <Sidebar activeUsers={activeUsers} /> {/* Pass active users */}
              </div>
            </div>
            <div className="flex-grow w-full md:w-auto">
              <Chat
                username={user?.username || user?.firstName || "Guest"}
                socket={socket}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
