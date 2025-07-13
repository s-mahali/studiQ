import React, { useEffect, useRef, useState } from 'react';
import Peer from "peerjs";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { Mic, MicOff, PhoneOff } from 'lucide-react';

const PeerConnection = () => {
    const [peerId, setPeerId] = useState('');
    const [remotePeerId, setRemotePeerId] = useState('');
    const [isInCall, setIsInCall] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [callerName, setCallerName] = useState('');
    
    const remoteAudioRef = useRef(null);
    const localAudioRef = useRef(null);
    const peerInstance = useRef(null);
    const currentCall = useRef(null);
    const localStream = useRef(null);

    useEffect(() => {
        //create a new peer
        const peer = new Peer();
       
        peer.on('open', (id) => {
            //get the peer id and store it
            setPeerId(id);
            console.log("My peer ID is: " + id);
            toast.success("Connected to signaling server");
        });
        
        peer.on('error', (err) => {
            console.error("Peer error:", err);
            toast.error(`Connection error: ${err.type}`);
        });
        
        // Handle incoming calls
        peer.on('call', (call) => {
            toast.success("Incoming call...");
            setCallerName(call.peer.substring(0, 8));
            
            // Get user media and answer the call
            navigator.mediaDevices.getUserMedia({audio: true})
                .then((mediaStream) => {
                    // Save local stream to mute later if needed
                    localStream.current = mediaStream;
                    
                    // Display local audio (muted to prevent feedback)
                    if (localAudioRef.current) {
                        localAudioRef.current.srcObject = mediaStream;
                        localAudioRef.current.play().catch(e => console.error("Local audio play error:", e));
                    }
                    
                    // Answer the call with our stream
                    call.answer(mediaStream);
                    
                    // Listen for their stream
                    call.on('stream', (remoteStream) => {
                        if (remoteAudioRef.current) {
                            remoteAudioRef.current.srcObject = remoteStream;
                            remoteAudioRef.current.play().catch(e => console.error("Remote audio play error:", e));
                        }
                        setIsInCall(true);
                    });
                    
                    // Handle call closing
                    call.on('close', () => {
                        endCall();
                    });
                    
                    currentCall.current = call;
                })
                .catch(err => {
                    console.error("Failed to get local stream", err);
                    toast.error("Couldn't access microphone");
                });
        });
        
        // Save peer instance
        peerInstance.current = peer;
        
        // Clean up on unmount
        return () => {
            if (currentCall.current) {
                currentCall.current.close();
            }
            if (localStream.current) {
                // Stop local stream
                localStream.current.getTracks().forEach(track => track.stop());
            }
            // Destroy peer
            peer.destroy();
        };
    }, []);

    // Function to initiate a call to a remote peer
    const initiateCall = () => {
        //manually entering peer id to test, later need to make it dynamic
        if (!remotePeerId) {
            toast.error("Please enter a peer ID");
            return;
        }
        
        navigator.mediaDevices.getUserMedia({audio: true})
            .then((mediaStream) => {
                // Save local stream
                localStream.current = mediaStream;
                
                // Display local audio
                if (localAudioRef.current) {
                    localAudioRef.current.srcObject = mediaStream;
                    localAudioRef.current.play().catch(e => console.error("Local audio play error:", e));
                }
                
                // Call the remote peer
                const call = peerInstance.current.call(remotePeerId, mediaStream);
                toast.success("Calling peer...");
                
                call.on('stream', (remoteStream) => {
                    if (remoteAudioRef.current) {
                        remoteAudioRef.current.srcObject = remoteStream;
                        remoteAudioRef.current.play().catch(e => console.error("Remote audio play error:", e));
                    }
                    setIsInCall(true);
                    setCallerName(remotePeerId.substring(0, 8));
                });
                
                call.on('close', () => {
                    endCall();
                });
                
                call.on('error', (err) => {
                    console.error("Call error:", err);
                    toast.error("Call failed");
                    endCall();
                });
                
                currentCall.current = call;
            })
            .catch(err => {
                console.error("Failed to get local stream", err);
                toast.error("Couldn't access microphone");
            });
    };
    
    const endCall = () => {
        if (currentCall.current) {
            currentCall.current.close();
            currentCall.current = null;
        }
        
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
            localStream.current = null;
        }
        
        if (localAudioRef.current) {
            localAudioRef.current.srcObject = null;
        }
        
        if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = null;
        }
        
        setIsInCall(false);
        setIsMuted(false);
        setCallerName('');
        toast.success("Call ended");
    };
    
    const toggleMute = () => {
        if (localStream.current) {
            const audioTrack = localStream.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = isMuted;
                setIsMuted(!isMuted);
                toast(isMuted ? "Microphone unmuted" : "Microphone muted");
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-900 text-white">
            <div className="w-full max-w-md p-6 bg-slate-800 rounded-lg shadow-xl">
                <h1 className="text-2xl font-bold text-center mb-2">Audio Call</h1>
                <div className="bg-slate-700 p-3 rounded-md text-center mb-6">
                    <p className="text-sm text-slate-300">Your ID:</p>
                    <p className="text-lg font-mono font-semibold break-all">{peerId || "Connecting..."}</p>
                </div>
                
                {!isInCall ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-300 mb-1">Remote Peer ID</label>
                            <Input
                                placeholder="Enter ID to call"
                                value={remotePeerId}
                                onChange={(e) => setRemotePeerId(e.target.value)}
                                className="bg-slate-700 border-slate-600 text-white"
                            />
                        </div>
                        <Button 
                            onClick={initiateCall} 
                            className="w-full bg-teal-600 hover:bg-teal-700"
                        >
                            Start Call
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="text-center">
                            <p className="text-sm text-slate-300">In call with:</p>
                            <p className="text-lg font-semibold">{callerName}</p>
                            <div className="mt-4 p-4 bg-slate-900 rounded-lg flex items-center justify-center">
                                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center animate-pulse">
                                    <span className="text-xl font-bold">
                                        {callerName.substring(0, 2).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-center space-x-4">
                            <Button 
                                onClick={toggleMute} 
                                className={`rounded-full p-3 ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                                size="icon"
                            >
                                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                            </Button>
                            <Button 
                                onClick={endCall} 
                                className="bg-red-500 hover:bg-red-600 rounded-full p-3"
                                size="icon"
                            >
                                <PhoneOff size={20} />
                            </Button>
                        </div>
                    </div>
                )}
                
                {/* Hidden audio elements */}
                <audio ref={localAudioRef} muted className="hidden" />
                <audio ref={remoteAudioRef} className="hidden" />
            </div>
        </div>
    );
};

export default PeerConnection;