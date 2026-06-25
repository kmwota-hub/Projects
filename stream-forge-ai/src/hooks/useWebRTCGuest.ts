import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Guest {
  socketId: string;
  userId: string;
  stream: MediaStream;
}

export function useWebRTCGuest() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState<string>('');
  const [guests, setGuests] = useState<Guest[]>([]);
  
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

  useEffect(() => {
    // Generate a random room ID for this studio session
    const newRoomId = Math.random().toString(36).substring(2, 9);
    setRoomId(newRoomId);

    const s = io('http://localhost:4000');
    setSocket(s);

    s.on('connect', () => {
      console.log('Host connected to signaling server, joining room:', newRoomId);
      s.emit('join-room', newRoomId, 'host');
    });

    s.on('webrtc-offer', async (offer, senderSocketId) => {
      console.log('Received WebRTC offer from guest', senderSocketId);
      
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnections.current.set(senderSocketId, pc);

      pc.ontrack = (event) => {
        setGuests(prev => {
          // Check if guest already exists
          const existing = prev.find(g => g.socketId === senderSocketId);
          if (existing) {
            existing.stream.addTrack(event.track);
            return [...prev];
          } else {
            const newStream = new MediaStream();
            newStream.addTrack(event.track);
            return [...prev, { socketId: senderSocketId, userId: 'guest', stream: newStream }];
          }
        });
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          s.emit('webrtc-ice-candidate', newRoomId, event.candidate, senderSocketId);
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      s.emit('webrtc-answer', newRoomId, answer, senderSocketId);
    });

    s.on('webrtc-ice-candidate', async (candidate, senderSocketId) => {
      const pc = peerConnections.current.get(senderSocketId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    s.on('user-disconnected', (userId, socketId) => {
      console.log('Guest disconnected', socketId);
      const pc = peerConnections.current.get(socketId);
      if (pc) pc.close();
      peerConnections.current.delete(socketId);
      setGuests(prev => prev.filter(g => g.socketId !== socketId));
    });

    return () => {
      peerConnections.current.forEach(pc => pc.close());
      s.disconnect();
    };
  }, []);

  return { socket, roomId, guests };
}
