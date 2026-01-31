import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './SocketContext';
import api from '../utils/api';

const VideoCallContext = createContext();

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within VideoCallProvider');
  }
  return context;
};

export const VideoCallProvider = ({ children }) => {
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const { socket, isConnected } = useSocket();
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Initialize peer connection
  const createPeerConnection = useCallback(
    (remoteUserId, callId) => {
      const peerConnection = new RTCPeerConnection(iceServers);

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('webrtc:ice-candidate', {
            to: remoteUserId,
            candidate: event.candidate,
            callId,
          });
        }
      };

      peerConnection.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);
        if (
          peerConnection.connectionState === 'disconnected' ||
          peerConnection.connectionState === 'failed'
        ) {
          endCall();
        }
      };

      return peerConnection;
    },
    [socket]
  );

  // Get user media
  const getUserMedia = useCallback(async (audio = true, video = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio,
        video: video ? { facingMode: 'user' } : false,
      });

      setLocalStream(stream);
      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error('Get user media error:', error);
      throw error;
    }
  }, []);

  // Initiate call
  const initiateCall = useCallback(
    async (conversationId, participants) => {
      try {
        // Create call in backend
        const response = await api.post('/video/calls', { conversationId });
        const call = response.data.call;

        setActiveCall(call);

        // Get local stream
        const stream = await getUserMedia();

        // Notify other participants via socket
        if (socket) {
          socket.emit('call:initiate', {
            conversationId,
            callId: call._id,
          });
        }

        return call;
      } catch (error) {
        console.error('Initiate call error:', error);
        throw error;
      }
    },
    [socket, getUserMedia]
  );

  // Answer call
  const answerCall = useCallback(
    async (callId, remoteUserId) => {
      try {
        // Join call in backend
        await api.post(`/video/calls/${callId}/join`);

        // Get local stream
        const stream = await getUserMedia();

        // Create peer connection
        const peerConnection = createPeerConnection(remoteUserId, callId);
        peerConnectionRef.current = peerConnection;

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });

        // Create answer
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        // Send answer to caller
        if (socket) {
          socket.emit('webrtc:answer', {
            to: remoteUserId,
            answer: peerConnection.localDescription,
            callId,
          });
        }

        setIsCallActive(true);
        setIncomingCall(null);
      } catch (error) {
        console.error('Answer call error:', error);
        throw error;
      }
    },
    [socket, getUserMedia, createPeerConnection]
  );

  // Reject call
  const rejectCall = useCallback(
    async (callId) => {
      try {
        await api.post(`/video/calls/${callId}/reject`);

        if (socket) {
          socket.emit('call:reject', { callId });
        }

        setIncomingCall(null);
      } catch (error) {
        console.error('Reject call error:', error);
      }
    },
    [socket]
  );

  // End call
  const endCall = useCallback(async () => {
    try {
      if (activeCall) {
        await api.post(`/video/calls/${activeCall._id}/end`);

        if (socket) {
          socket.emit('call:end', {
            callId: activeCall._id,
            conversationId: activeCall.conversationId,
          });
        }
      }

      // Stop all tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      setLocalStream(null);
      setRemoteStream(null);
      setActiveCall(null);
      setIsCallActive(false);
      setIsMuted(false);
      setIsVideoOff(false);
    } catch (error) {
      console.error('End call error:', error);
    }
  }, [activeCall, socket]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Incoming call
    socket.on('call:incoming', ({ callId, conversationId, caller }) => {
      setIncomingCall({ callId, conversationId, caller });
    });

    // WebRTC offer
    socket.on('webrtc:offer', async ({ from, offer, callId }) => {
      try {
        const peerConnection = createPeerConnection(from, callId);
        peerConnectionRef.current = peerConnection;

        // Get local stream if not already available
        if (!localStreamRef.current) {
          const stream = await getUserMedia();
          stream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, stream);
          });
        } else {
          localStreamRef.current.getTracks().forEach((track) => {
            peerConnection.addTrack(track, localStreamRef.current);
          });
        }

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit('webrtc:answer', {
          to: from,
          answer: peerConnection.localDescription,
          callId,
        });

        setIsCallActive(true);
      } catch (error) {
        console.error('Handle offer error:', error);
      }
    });

    // WebRTC answer
    socket.on('webrtc:answer', async ({ from, answer }) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          setIsCallActive(true);
        }
      } catch (error) {
        console.error('Handle answer error:', error);
      }
    });

    // ICE candidate
    socket.on('webrtc:ice-candidate', async ({ from, candidate }) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        console.error('Handle ICE candidate error:', error);
      }
    });

    // Call rejected
    socket.on('call:rejected', ({ callId }) => {
      endCall();
    });

    // Call ended
    socket.on('call:ended', ({ callId }) => {
      endCall();
    });

    return () => {
      socket.off('call:incoming');
      socket.off('webrtc:offer');
      socket.off('webrtc:answer');
      socket.off('webrtc:ice-candidate');
      socket.off('call:rejected');
      socket.off('call:ended');
    };
  }, [socket, isConnected, createPeerConnection, getUserMedia, endCall]);

  const value = {
    activeCall,
    incomingCall,
    localStream,
    remoteStream,
    isCallActive,
    isMuted,
    isVideoOff,
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  };

  return <VideoCallContext.Provider value={value}>{children}</VideoCallContext.Provider>;
};
