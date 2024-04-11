import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../provider/SocketProvider";
import "../css/HomePage.css";

function Home() {
  const navigate = useNavigate();
  const [emailId, setEmailId] = useState("");
  const [roomId, setRoomId] = useState("");

  const { socket } = useSocket();

  const handleRoomJoin = () => {
    socket.emit("join-room", { roomId, emailId });
  };

  const handleJoinedUser = useCallback(
    (data) => {
      navigate(`/room/${data.roomId}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("user-joined", handleJoinedUser);

    return () => {
      socket.off("user-joined", handleJoinedUser);
    };
  }, [handleJoinedUser, socket]);

  return (
    <div className="homepage-container">
      <div className="input-container">
        <input
          placeholder="Enter your email..."
          onChange={(e) => setEmailId(e.target.value)}
        />
        <input
          placeholder="Emter the Room ID..."
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={handleRoomJoin}>Join</button>
      </div>
    </div>
  );
}

export default Home;
