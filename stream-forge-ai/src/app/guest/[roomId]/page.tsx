"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

export default function GuestPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [connectedToHost, setConnectedToHost] = useState(false);

  useEffect(() => {
    // 1. Get Camera
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (e) {
        console.error("Camera access denied", e);
      }
    }
    setupCamera();

    // 2. Connect to Signaling Server
    const s = io("http://localhost:4000");
    setSocket(s);

    s.on("connect", () => {
      console.log("Connected to signaling server");
      s.emit("join-room", roomId, "guest-user");
    });

    s.on("user-connected", async (userId, socketId) => {
      // The host connected. Let's create an offer
      console.log("Host connected, initiating WebRTC");
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnectionRef.current = pc;

      // Add local stream tracks
      if (stream) {
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
      }

      pc.onicecandidate = event => {
        if (event.candidate) {
          s.emit("webrtc-ice-candidate", roomId, event.candidate, socketId);
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      s.emit("webrtc-offer", roomId, offer, socketId);
    });

    s.on("webrtc-answer", async (answer) => {
      console.log("Received WebRTC answer from host");
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        setConnectedToHost(true);
      }
    });

    s.on("webrtc-ice-candidate", async (candidate) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      if (peerConnectionRef.current) peerConnectionRef.current.close();
      s.disconnect();
    };
  }, [roomId]); // Dependencies intentionally limited to avoid re-running on stream update

  // Re-add tracks if stream changes
  useEffect(() => {
    if (stream && peerConnectionRef.current && peerConnectionRef.current.signalingState !== "closed") {
       const senders = peerConnectionRef.current.getSenders();
       stream.getTracks().forEach(track => {
         const sender = senders.find(s => s.track?.kind === track.kind);
         if (sender) {
           sender.replaceTrack(track);
         } else {
           peerConnectionRef.current?.addTrack(track, stream);
         }
       });
    }
  }, [stream]);

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraActive(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicActive(audioTrack.enabled);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-[#15151a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Guest Studio
            </h1>
            <p className="text-sm text-white/40 mt-1">Room ID: {roomId}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${connectedToHost ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
              <div className={`w-2 h-2 rounded-full ${connectedToHost ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`} />
              {connectedToHost ? 'Live with Host' : 'Waiting for Host...'}
            </span>
          </div>
        </div>
        
        <div className="relative aspect-video bg-black flex-1">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted // Mute local playback to avoid echo
            className="w-full h-full object-cover"
          />
          
          {/* Controls Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 p-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl">
            <button
              onClick={toggleMic}
              className={`p-4 rounded-xl transition-all ${micActive ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30'}`}
            >
              {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleCamera}
              className={`p-4 rounded-xl transition-all ${cameraActive ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30'}`}
            >
              {cameraActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
