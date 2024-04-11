import React from "react";
import { Routes, Route } from "react-router-dom";
import { SocketProvider } from "./provider/SocketProvider";
import { PeerProvider } from "./provider/Peer";
import Home from "./pages/Home";
import Room from "./pages/Room";

function App() {
  return (
    <div className="App">
      <SocketProvider>
        <PeerProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomId" element={<Room />} />
          </Routes>
        </PeerProvider>
      </SocketProvider>
    </div>
  );
}

export default App;
