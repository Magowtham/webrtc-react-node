const express = require("express");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");

const io = new Server({
  cors: true,
});
const app = express();

app.use(bodyParser.json());

const emailIdToScoketId = new Map();
const socketIdToEmailId = new Map();

io.on("connection", (socket) => {
  socket.on("join-room", (data) => {
    const { emailId, roomId } = data;
    emailIdToScoketId.set(emailId, socket.id);
    socketIdToEmailId.set(socket.id, emailId);
    socket.join(roomId);

    console.log("user", emailId, "joined the room", roomId);
    socket.broadcast.to(roomId).emit("user-joined", { emailId, roomId });
    socket.emit("user-joined", { emailId, roomId });
  });

  socket.on("call-user", (data) => {
    const { emailId, offer } = data;

    const fromEmailId = socketIdToEmailId.get(socket.id);
    const socketId = emailIdToScoketId.get(emailId);
    console.log("incoming call started...");
    console.log(emailIdToScoketId);
    socket.to(socketId).emit("incoming-call", { from: fromEmailId, offer });
  });

  socket.on("call-accepted", (data) => {
    const { emailId, answer } = data;
    const socketId = emailIdToScoketId.get(emailId);

    socket.to(socketId).emit("call-accepted", { answer });
  });
});

app.listen(8000, () => {
  console.log("HTTP server is running");
});

io.listen(8001);
