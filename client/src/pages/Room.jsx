import React, { useEffect, useCallback, useState } from "react";
import { useSocket } from "../provider/SocketProvider";
import { usePeer } from "../provider/Peer";
import ReactPlayer from "react-player";

function Room() {
  const [localStream, setLocalStream] = useState(null);
  const [remoteEmailId, setRemoteEmailId] = useState("");
  const { socket } = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setDescriptionAnswer,
    sendStream,
    remoteStreams,
  } = usePeer();

  const getUserMedia = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    console.log(stream);
    setLocalStream(stream);
  }, []);

  const handleNewUser = useCallback(
    async (data) => {
      const { emailId } = data;
      const offer = await createOffer();
      socket.emit("call-user", { emailId, offer });
    },
    [createOffer, socket]
  );

  const handleIncomingCall = useCallback(
    async (data) => {
      const { from, offer } = data;

      console.log("incoming call from", from, offer);

      const answer = await createAnswer(offer);

      socket.emit("call-accepted", { emailId: from, answer });
      setRemoteEmailId(from);
    },
    [createAnswer, socket]
  );

  const handleCallAccept = useCallback(
    async (data) => {
      const { answer } = data;
      await setDescriptionAnswer(answer);
      console.log("call accepted");
    },
    [setDescriptionAnswer]
  );

  const handleNegotiation = useCallback(() => {
    const localOffer = peer.localDescription;
    socket.emit("call-user", { emailId: remoteEmailId, offer: localOffer });
  }, [peer.localDescription, remoteEmailId, socket]);

  useEffect(() => {
    socket.on("user-joined", handleNewUser);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccept);
    return () => {
      socket.off("user-joined", handleNewUser);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccept);
    };
  }, [handleCallAccept, handleIncomingCall, handleNewUser, socket]);

  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNegotiation);
    return () => {
      peer.removeEventListener("negotiationneeded", handleNegotiation);
    };
  }, [handleNegotiation, peer]);

  useEffect(() => {
    getUserMedia();
  }, [getUserMedia]);

  return (
    <div>
      <h1>you are now connected with: {remoteEmailId}</h1>
      <ReactPlayer url={localStream} playing />
      <ReactPlayer url={remoteStreams} playing />
      <button onClick={() => sendStream(localStream)}>send</button>
    </div>
  );
}

export default Room;
