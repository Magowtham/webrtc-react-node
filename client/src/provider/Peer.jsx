import React, {
  createContext,
  useMemo,
  useEffect,
  useCallback,
  useState,
} from "react";

const PeerContext = createContext(null);

export const usePeer = () => React.useContext(PeerContext);

export const PeerProvider = (props) => {
  const [remoteStreams, setRemoteStreams] = useState(null);

  const peer = useMemo(
    () =>
      new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun1.1.google.com:19302",
              "stun:stun2.1.google.com:19302",
            ],
          },
        ],
      }),
    []
  );

  const createOffer = async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  };

  const createAnswer = async (offer) => {
    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    return answer;
  };

  const setDescriptionAnswer = async (answer) => {
    await peer.setRemoteDescription(answer);
  };

  const sendStream = async (stream) => {
    const tracks = stream.getTracks();
    //console.log(tracks);
    for (const track of tracks) {
      // console.log(track);
      peer.addTrack(track, stream);
    }
  };

  const handleTrackEvent = useCallback(async (event) => {
    const streams = event.streams;
    console.log(streams);
    setRemoteStreams(streams[0]);
  }, []);

  useEffect(() => {
    peer.addEventListener("track", handleTrackEvent);

    return () => {
      peer.removeEventListener("track", handleTrackEvent);
    };
  }, [handleTrackEvent, peer]);
  return (
    <PeerContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        setDescriptionAnswer,
        sendStream,
        remoteStreams,
      }}
    >
      {props.children}
    </PeerContext.Provider>
  );
};
