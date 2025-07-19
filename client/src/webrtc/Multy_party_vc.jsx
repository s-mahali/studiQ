import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  checkActiveCall,
  joinVc,
  leaveVc,
  mediaToggle,
  startVc,
} from "@/services/api.services";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { Mic, MicOff, Users, PhoneOff } from "lucide-react";
import Peer from "peerjs";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const MultiVc = ({ groupId }) => {
  // const { groupId } = useParams();
  const socket = useSelector((state) => state.socketio.socket);
  const user = useSelector((state) => state.auth.user);

  //local states
  const [peerId, setPeerId] = useState("");
  const [isInCall, setIsInCall] = useState(false);
  const [callParticipants, setCallParticipants] = useState([]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setVideoEnabled] = useState(true);

  //userefs
  const peerInstance = useRef(null);
  const localStreamRef = useRef(null);
  const connections = useRef({});
  const audioElements = useRef({});

  //Initialize peerjs
  useEffect(() => {
    //create a new peer and connect to signaling server of peerjs
    const peer = new Peer();

    peer.on("open", (id) => {
      setPeerId(id);
      console.log("My peer ID is: " + id);
    });

    //handle error
    peer.on("error", (err) => {
      console.error("Peer error:", err);
    });

    //handle incoming calls
    peer.on("call", async (call) => {
      console.log("Incoming call:", call.peer);
      //get the local stream
      if (!localStreamRef.current) {
        try {
          localStreamRef.current = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
        } catch (error) {
          console.error("Failed to get local stream", error);
          return;
        }
      }

      //answer the call
      call.answer(localStreamRef.current);

      //handle upcoming stream
      call.on("stream", (remoteStream) => {
        console.log("Received incoming stream from:", call.peer);
        addAudioElement(call.peer, remoteStream); // helper function
      });

      //handle call close
      call.on("close", () => {
        console.log("Call closed with:", call.peer);
        removeAudiElement(call.peer, null); // helper function
      });

      //save the connection
      connections.current[call.peer] = call;
      console.log("Connections:", connections.current);
    });
    peerInstance.current = peer;

    //cleanup is important to avoid memory leak and inconsistent behavior
    return () => {
      cleanupCall(); // cleanup function call
      peer.destroy();
    };
  }, []);

  //check if there's an active call when component mounts
  useEffect(() => {
    if (groupId && user) {
      handleCheckActiveCall(); // helper function to check if there's an active call
    }
  }, [groupId, user, socket, peerId, isInCall, isCallActive]);

  //Check if there's an active call in this group
  const handleCheckActiveCall = async () => {
    try {
      const res = await checkActiveCall(groupId);
      if (res?.status === 200 && res?.data.payload.isActive) {
        console.log("active call", res?.data.payload);
        setIsCallActive(true);
        setCallParticipants(res?.data.payload.participants);
        if(res?.data.payload.participants.length === 0) {
          setIsInCall(false);
          setIsCallActive(false);
        }
      }
    } catch (error) {
      console.error("Error while checking active call", error?.message);
    }
  };

  //connect to socket for real-time updates
  useEffect(() => {
    if (!socket || !user || !groupId || !peerId) return;

    //Lsten for call started event
    //have a doubt about callGroupId
    const handleCallStarted = ({ groupId: callGroupId, initiator }) => {
      if (callGroupId === groupId && initiator !== user._id) {
        console.log("initiator", initiator, callGroupId);
        setIsCallActive(true);
        toast.success("A voice call has started in this group");
      }
    };

    //Listen for new participant
    const handleUserJoined = ({
      groupId: callGroupId,
      userId,
      peerId: remotePeerId,
    }) => {
      if (callGroupId === groupId && userId !== user._id) {
        toast.success(`peer joined the call`);
        console.log("new participant:", userId, remotePeerId);
        handleCheckActiveCall();
        //call the new participant
        if (isInCall && localStreamRef.current) {
          console.log("calling new participant:", remotePeerId);
          callPeer(remotePeerId); // helper function
        }
      }
    };

    //Listen for participant leaving
    const handleUserLeft = ({ groupId: callGroupId, userId }) => {
      if (callGroupId === groupId) {
        toast(`peer left the call`);
        //update participants list
        setCallParticipants((prev) =>
          prev.filter((p) => p.userId._id !== userId)
        );
      }
    };

    //Listen for peer connections
    const handlePeerConnected = ({ userId, peerId: remotePeerId }) => {
      console.log("Peer connected:", userId, remotePeerId);
      //If we're in call connect to this peer
      if (isInCall && localStreamRef.current) {
        callPeer(remotePeerId);
      }
    };

    //Listen for media toggled
    const handleMediaToggled = ({ userId, audio, video }) => {
      //Update the UI to reflect mute state changes
      setCallParticipants((prev) =>
        prev.map((p) => {
          p.userId._id === userId
            ? {
                ...p,
                audio,
                video,
              }
              : p
            
        }) 
      );
    };

    //Register socket Event listeners
    socket.on("voiceCall:started", handleCallStarted);
    socket.on("voiceCall:userJoined", handleUserJoined);
    socket.on("voiceCall:userLeft", handleUserLeft);
    socket.on("voiceCall:peerConnected", handlePeerConnected);
    socket.on("voiceCall:mediaToggled", handleMediaToggled);

    //when we have a peerId, let the server know
    if (isInCall) {
      socket.emit("voiceCall:peerConnect", {
        userId: user._id,
        groupId,
        peerId,
      });

      //Get existing peers
      socket.emit(
        "voiceCall:getPeers",
        {
          groupId,
        },
        (peers) => {
          console.log("Existing peers", peers);
          //Connect to existing peers
          peers?.forEach((peer) => {
            if (peer.userId !== user._id) {
              callPeer(peer.peerId);
            }
          });
        }
      );
    }

    return () => {
      socket.off("voiceCall:started", handleCallStarted);
      socket.off("voiceCall:userJoined", handleUserJoined);
      socket.off("voiceCall:userLeft", handleUserLeft);
      socket.off("voiceCall:peerConnected", handlePeerConnected);
      socket.off("voiceCall:mediaToggled", handleMediaToggled);

      //Disconnect from server
      if (isInCall) {
        socket.emit("voiceCall:peerDisconnect", {
          userId: user._id,
          groupId,
        });
      }
    };
  }, [socket, user, groupId, peerId, isInCall]);

  

  

  //Start a new call
  const handleStartCall = async () => {
    try {
      //Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      const res = await startVc(groupId);
      if (res?.status === 200) {
        setIsInCall(true);
        setIsCallActive(true);
        setCallParticipants(res?.data.payload);
        toast.success(res?.data.message);
      }
    } catch (error) {
      console.error("Error while starting call", error?.message);
      toast.error(error?.res.data.message || "Coudn't start the call");
    }
  };

  //Join an existing call
  const handleJoinCall = async () => {
    try {
      //Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      //join call on server
      const res = await joinVc(groupId, peerId);
      if (res?.status === 200) {
        setIsInCall(true);
        setIsCallActive(true);
        setCallParticipants(res?.data.payload);
        toast.success(res?.data.message);
      }
    } catch (error) {
      console.error("Error while joining call", error?.message);
      toast.error(error?.res.data.message || "Coudn't join the call");
    }
  };

  //Leave a call
  const handleLeaveCall = async () => {
    try {
      await leaveVc(groupId);
      setIsInCall(false);
      cleanupCall();
      
      toast.success("You left the call");
    } catch (error) {
      console.error("Error while leaving call", error?.message);
      toast.error("Coudn't leave the call");
    }
  };

  //Toggle Microphone  mute/unmute
  const toggleMute = async () => {
    try {
      const newMuteState = !isMuted;
      //update locally
      if (localStreamRef.current) {
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !newMuteState;
        }
      }
      //update on server
      await mediaToggle(groupId, { audio: !newMuteState }); // have a doubt here
      setIsMuted(newMuteState);
      toast(newMuteState ? "Microphone muted" : "Microphone unmuted");
    } catch (error) {
      console.error("Error while toggling mute", error?.message);
      toast.error("Coudn't toggle mute");
    }
  };

  //helper to call a peer
  const callPeer = (remotePeerId) => {
    if (!localStreamRef.current || !peerInstance.current) {
      return;
    }
    console.log("Calling peer:", remotePeerId);
    //Don't call if already connected
    if (connections.current[remotePeerId]) return;
    //call the peer
    const call = peerInstance.current.call(
      remotePeerId,
      localStreamRef.current
    );
    //Handle the stream
    call.on("stream", (remoteStream) => {
      console.log("Got stream from", remotePeerId);
      addAudioElement(remotePeerId, remoteStream);
    });

    //handle call close
    call.on("close", () => {
      console.log("call closed with", remotePeerId);
      removeAudiElement(remotePeerId);
    });

    //save the connection
    connections.current[remotePeerId] = call;
  };

  //Helper to add audio element for remote stream
  const addAudioElement = (peerId, stream) => {
    if (audioElements.current[peerId]) {
      audioElements.current[peerId].srcObject = stream;
      return;
    }
    const audio = new Audio();
    audio.srcObject = stream;
    audio.play();
    audio.id = `audio-${peerId}`;
    audioElements.current[peerId] = audio;
    document.body.appendChild(audio);
  };

  //Helper to remove audio element for remote stream
  const removeAudiElement = (peerId) => {
    if (audioElements.current[peerId]) {
      document.body.removeChild(audioElements.current[peerId]);
      delete audioElements.current[peerId];
    }
  };

  //cleanup all call resources
  const cleanupCall = () => {
    //close all connections
    Object.values(connections.current).forEach((connection) =>
      connection.close()
    );
    connections.current = {};

    //remove all audio elements
    Object.values(audioElements.current).forEach((audio) => {
      document.body.removeChild(audio);
    });
    audioElements.current = {};

    //stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      localStreamRef.current = null;
    }
  };

  // Helper to get user details by ID
  const getUserDetails = (userId) => {
    const participant = callParticipants.find((p) => p.userId._id === userId);
    return participant?.userId;
  };

  return (
    <div className="w-full flex flex-col h-full bg-slate-900 text-white p-4 rounded-md">
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <Users className="w-10 h-10 text-teal-400 mr-2" />
        Voice Chat - general
      </h2>

      {isCallActive && callParticipants.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-md p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">
                Participants ({callParticipants.length})
              </h3>
              {!isInCall && <Button onClick={handleJoinCall}>Join Call</Button>}
            </div>

            <div className="space-y-2">
              {callParticipants.map((participant) => (
                <div
                  key={participant.userId._id}
                  className="flex items-center justify-between p-2 bg-slate-700 rounded-md"
                >
                  <div className="flex items-center">
                    <Avatar className={"h-8 w-8 mr-2"}>
                      {participant.userId.profilePicture?.url ? (
                        <AvatarImage
                          src={participant.userId.profilePicture.url}
                        />
                      ) : (
                        <AvatarFallback className="text-sm">
                          {participant.userId.username?.substring(0, 2)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-sm">
                      {participant.userId.username}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!participant.audio && (
                      <MicOff className="w-4 h-4 text-red-400 mr-1" />
                    )}
                    <div
                      className={`w-2 h-2 rounded-full ${
                        participant.audio ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                  </div>
                </div>
              ))}

              {callParticipants.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-2">
                  No one is here{" "}
                </p>
              )}
            </div>
          </div>

          {isInCall && (
            <div className="flex justify-center space-x-3">
              <Button
                onClick={toggleMute}
                className={`rounded-full p-3 ${
                  isMuted
                    ? "bg-red-400 hover:bg-red-500"
                    : "bg-slate-700 hover:bg-slate-600"
                } `}
                size={"icon"}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </Button>

              <Button
                onClick={handleLeaveCall}
                className="bg-red-500 hover:bg-red-600 rounded-full p-3"
                size="icon"
              >
                <PhoneOff size={20} />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="bg-slate-800 rounded-full p-5 mb-4">
            <Users size={32} className="text-teal-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">No active voice call</h3>
          <p className="text-sm text-slate-400 mb-4 text-center">
            Start a voice call to chat with members of this group
          </p>
          <Button
            onClick={handleStartCall}
            className="bg-teal-600 hover:bg-teal-700"
          >
            Start Voice Call
          </Button>
        </div>
      )}
    </div>
  );
};

export default MultiVc;
