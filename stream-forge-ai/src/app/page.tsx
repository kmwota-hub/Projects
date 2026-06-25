"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera, Monitor, Mic, MicOff, Settings, Play, Square, Sparkles, Sliders,
  Volume2, Share2, Type, LayoutTemplate, Zap, Activity, ShieldCheck,
  Sun, Contrast, ImageIcon, Radio, Wifi, WifiOff, BarChart3,
  ChevronRight, Loader2, Check, X, Eye, Clock, Gauge,
  UserPlus, Copy, Users, Maximize2
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { OverlayRenderer, defaultOverlays, type OverlayItem } from "@/components/OverlayRenderer";
import { VideoFilterPipeline, DEFAULT_FILTERS, type VideoFilterSettings } from "@/lib/video-filters";
import { initializeAIModels, isAIReady, getFaceLandmarker } from "@/lib/ai-processor";
import { createAutoFrameState, updateAutoFrame, type AutoFrameState } from "@/lib/auto-framer";
import { io, Socket } from "socket.io-client";
import { useWebRTCGuest, type Guest } from "@/hooks/useWebRTCGuest";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ─── Simulcast Platform Configs ─── */
interface SimulcastPlatform {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  icon: string;
  status: "idle" | "connecting" | "live" | "error";
}

const defaultPlatforms: SimulcastPlatform[] = [
  { id: "youtube", name: "YouTube", color: "#FF0000", enabled: false, icon: "▶", status: "idle" },
  { id: "twitch", name: "Twitch", color: "#9146FF", enabled: false, icon: "⬡", status: "idle" },
  { id: "facebook", name: "Facebook", color: "#1877F2", enabled: false, icon: "f", status: "idle" },
  { id: "linkedin", name: "LinkedIn", color: "#0A66C2", enabled: false, icon: "in", status: "idle" },
  { id: "rtmp", name: "Custom RTMP", color: "#6366f1", enabled: false, icon: "⟐", status: "idle" },
];

/* ─── Guest Video Tile ─── */
function GuestTile({ guest, index, isActive, onClick }: { guest: Guest; index: number; isActive: boolean; onClick: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && guest.stream) {
      videoRef.current.srcObject = guest.stream;
    }
  }, [guest.stream]);

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-32 aspect-video rounded-xl border-2 overflow-hidden transition-all cursor-pointer group",
        isActive
          ? "border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
          : "border-white/10 hover:border-white/30"
      )}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[9px] text-white/60 font-medium">
        Guest {index + 1}
      </div>
      <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
    </button>
  );
}
/* ─── Main Component ─── */
export default function StudioDashboard() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamDuration, setStreamDuration] = useState(0);
  const [activeTab, setActiveTab] = useState<"ai" | "editor" | "audio" | "destinations">("ai");
  const [isMuted, setIsMuted] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [aiStatus, setAiStatus] = useState<"loading" | "ready" | "off">("off");
  const [fps, setFps] = useState(0);
  const [platforms, setPlatforms] = useState<SimulcastPlatform[]>(defaultPlatforms);
  const [overlays, setOverlays] = useState<OverlayItem[]>(defaultOverlays);
  const [filters, setFilters] = useState<VideoFilterSettings>(DEFAULT_FILTERS);
  const [activeScene, setActiveScene] = useState("main");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [activeCamera, setActiveCamera] = useState<string>("host"); // "host" or guest socketId

  // WebRTC Guest System
  const { roomId, guests } = useWebRTCGuest();

  // AI feature toggles
  const [aiFeatures, setAiFeatures] = useState({
    autoLighting: true,
    faceEnhancement: true,
    backgroundBlur: false,
    autoFraming: true,
    noiseCancellation: true,
    voiceEQ: true,
    autoVolume: false,
    echoRemoval: true,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filterPipelineRef = useRef<VideoFilterPipeline | null>(null);
  const autoFrameStateRef = useRef<AutoFrameState | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  /* ─── Camera Setup ─── */
  const setupCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        console.warn("Media devices API not available.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: "user" },
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (e) {
      console.warn("Camera access denied or no camera found.", e);
    }
  }, []);

  useEffect(() => {
    setupCamera();
  }, [setupCamera]);

  /* ─── AI Model Loading ─── */
  useEffect(() => {
    async function loadAI() {
      setAiStatus("loading");
      const success = await initializeAIModels();
      setAiStatus(success ? "ready" : "off");
    }
    loadAI();
  }, []);

  /* ─── WebGL Filter Pipeline ─── */
  useEffect(() => {
    if (canvasRef.current && !filterPipelineRef.current) {
      filterPipelineRef.current = new VideoFilterPipeline(canvasRef.current);
    }
    return () => {
      filterPipelineRef.current?.destroy();
      filterPipelineRef.current = null;
    };
  }, []);

  /* ─── Render Loop ─── */
  useEffect(() => {
    let frameCount = 0;
    let lastFpsTime = performance.now();

    function renderFrame() {
      const video = videoRef.current;
      const pipeline = filterPipelineRef.current;

      if (video && pipeline && video.readyState >= 2) {
        // Apply WebGL filters
        pipeline.render(video, filters);

        // AI face detection for auto-framing
        if (aiFeatures.autoFraming && isAIReady()) {
          const faceLandmarker = getFaceLandmarker();
          if (faceLandmarker) {
            try {
              const results = faceLandmarker.detectForVideo(video, performance.now());
              if (!autoFrameStateRef.current) {
                autoFrameStateRef.current = createAutoFrameState(video.videoWidth, video.videoHeight);
              }
              const faceBox = results.faceLandmarks?.[0]
                ? {
                    originX: Math.min(...results.faceLandmarks[0].map(l => l.x)),
                    originY: Math.min(...results.faceLandmarks[0].map(l => l.y)),
                    width: Math.max(...results.faceLandmarks[0].map(l => l.x)) - Math.min(...results.faceLandmarks[0].map(l => l.x)),
                    height: Math.max(...results.faceLandmarks[0].map(l => l.y)) - Math.min(...results.faceLandmarks[0].map(l => l.y)),
                  }
                : null;
              updateAutoFrame(autoFrameStateRef.current, faceBox, video.videoWidth, video.videoHeight);
            } catch {
              // Silently handle frame processing errors
            }
          }
        }

        // FPS counter
        frameCount++;
        const now = performance.now();
        if (now - lastFpsTime >= 1000) {
          setFps(frameCount);
          frameCount = 0;
          lastFpsTime = now;
        }
      }
      animFrameRef.current = requestAnimationFrame(renderFrame);
    }

    animFrameRef.current = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [filters, aiFeatures.autoFraming]);

  /* ─── Stream Timer & Streaming Logic ─── */
  useEffect(() => {
    if (isStreaming) {
      setStreamDuration(0);
      streamTimerRef.current = setInterval(() => {
        setStreamDuration(d => d + 1);
      }, 1000);
      
      // Connect to backend signaling server
      socketRef.current = io("http://localhost:4000");
      socketRef.current.on("connect", () => {
        console.log("Connected to signaling server");
        socketRef.current?.emit("start-stream", {
          destinations: {
            youtube: platforms.find(p => p.id === "youtube")?.enabled,
            twitch: platforms.find(p => p.id === "twitch")?.enabled,
          }
        });
      });

      // Start capturing the canvas stream
      if (canvasRef.current) {
        // Capture video at 30 fps
        const canvasStream = canvasRef.current.captureStream(30);
        
        // Try to add audio from the camera/mic if available
        if (videoRef.current && (videoRef.current.srcObject as MediaStream)) {
          const originalAudioTracks = (videoRef.current.srcObject as MediaStream).getAudioTracks();
          if (originalAudioTracks.length > 0) {
            canvasStream.addTrack(originalAudioTracks[0]);
          }
        }

        try {
          const mediaRecorder = new MediaRecorder(canvasStream, {
            mimeType: "video/webm;codecs=vp8,opus",
          });

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0 && socketRef.current) {
              socketRef.current.emit("binary-stream", event.data);
            }
          };

          mediaRecorder.start(100); // 100ms chunks
          mediaRecorderRef.current = mediaRecorder;
        } catch (err) {
          console.error("Failed to start MediaRecorder", err);
        }
      }

      setPlatforms(prev => {
        let changed = false;
        const next = prev.map(p => {
          if (p.enabled && p.status !== "live") {
            changed = true;
            return { ...p, status: "live" as const };
          }
          return p;
        });
        return changed ? next : prev;
      });
    } else {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
      setPlatforms(prev => {
        let changed = false;
        const next = prev.map(p => {
          if (p.status !== "idle") {
            changed = true;
            return { ...p, status: "idle" as const };
          }
          return p;
        });
        return changed ? next : prev;
      });
      
      // Stop media recorder and socket
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (socketRef.current) {
        socketRef.current.emit("stop-stream");
        socketRef.current.disconnect();
      }
    }
    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, [isStreaming, platforms]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const togglePlatform = (id: string) => {
    setPlatforms(prev => prev.map(p =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
  };

  const toggleOverlay = (id: string) => {
    setOverlays(prev => prev.map(o =>
      o.id === id ? { ...o, visible: !o.visible } : o
    ));
  };

  const toggleAiFeature = (key: keyof typeof aiFeatures) => {
    setAiFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activePlatformCount = platforms.filter(p => p.enabled).length;
  const livePlatformCount = platforms.filter(p => p.status === "live").length;

  const scenes = [
    { id: "main", label: "Main Camera", icon: LayoutTemplate },
    { id: "screen", label: "Screen Share + Cam", icon: Monitor },
    { id: "brb", label: "BRB Screen", icon: LayoutTemplate },
  ];

  return (
    <div className="flex h-screen w-full bg-[#0a0a0c] text-white overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* ─── Top Navigation ─── */}
      <nav className="absolute top-0 w-full h-14 bg-white/5 border-b border-white/10 backdrop-blur-md z-20 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            StreamForge AI
          </span>
          {isStreaming && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="ml-3 flex items-center gap-2"
            >
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-red-400">LIVE</span>
                <span className="text-xs text-red-400/70 font-mono">{formatDuration(streamDuration)}</span>
              </div>
              {livePlatformCount > 0 && (
                <span className="text-xs text-white/50">
                  → {livePlatformCount} platform{livePlatformCount > 1 ? "s" : ""}
                </span>
              )}
            </motion.div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-xs text-white/50 mr-2">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              {fps} FPS
            </span>
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              CPU 12%
            </span>
            <span className="flex items-center gap-1.5">
              {aiStatus === "ready" ? (
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              ) : aiStatus === "loading" ? (
                <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              ) : (
                <X className="w-3.5 h-3.5 text-white/30" />
              )}
              AI {aiStatus === "ready" ? "Ready" : aiStatus === "loading" ? "Loading…" : "Off"}
            </span>
          </div>
          <Link
            href="/analytics"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white/70 hover:text-white transition-colors border border-white/5"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Link>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-white/60" />
          </button>
          <img src="https://i.pravatar.cc/100?img=33" alt="Avatar" className="w-8 h-8 rounded-full border border-white/20" />
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <div className="flex w-full pt-14">
        {/* Left Sidebar - Scene & Source Management */}
        <aside className="w-60 border-r border-white/5 bg-white/[0.02] p-4 flex flex-col gap-5 overflow-y-auto">
          <div>
            <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2.5">Scenes</h3>
            <div className="space-y-1.5">
              {scenes.map(scene => (
                <button
                  key={scene.id}
                  onClick={() => setActiveScene(scene.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all",
                    activeScene === scene.id
                      ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-200"
                      : "hover:bg-white/5 text-white/60 border border-transparent"
                  )}
                >
                  <scene.icon className="w-4 h-4" />
                  {scene.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/5" />

          <div>
            <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2.5">Sources</h3>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 text-sm">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span className="text-white/80">Webcam</span>
                </div>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  cameraActive ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" : "bg-white/20"
                )} />
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 text-sm">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-emerald-400" />
                  <span className="text-white/80">Microphone</span>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={cn("w-1 h-3 rounded-full", i <= 3 ? "bg-emerald-500" : "bg-white/20")} />
                  ))}
                </div>
              </div>
            </div>
            <button className="w-full mt-2 py-2 rounded-lg border border-dashed border-white/15 text-white/40 hover:text-white/70 hover:border-white/30 text-xs transition-colors flex items-center justify-center gap-1.5">
              + Add Source
            </button>
          </div>

          <div className="h-px bg-white/5" />

          {/* Guest Invite Section */}
          <div>
            <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2.5">Guests</h3>
            <button
              onClick={() => setShowInviteModal(!showInviteModal)}
              className="w-full py-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 text-xs font-medium transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invite Guest
            </button>
            {showInviteModal && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 p-3 rounded-lg bg-black/40 border border-white/10 overflow-hidden"
              >
                <p className="text-[10px] text-white/40 mb-2">Share this link with your guest:</p>
                <div className="flex items-center gap-1.5">
                  <input
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/guest/${roomId}`}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white/70 font-mono truncate outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/guest/${roomId}`);
                      setInviteCopied(true);
                      setTimeout(() => setInviteCopied(false), 2000);
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
                  >
                    {inviteCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white/60" />}
                  </button>
                </div>
              </motion.div>
            )}
            {/* Connected Guests List */}
            {guests.length > 0 && (
              <div className="mt-2.5 space-y-1.5">
                {guests.map((guest, i) => (
                  <div key={guest.socketId} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                      <span className="text-white/80 text-xs">Guest {i + 1}</span>
                    </div>
                    <button
                      onClick={() => setActiveCamera(guest.socketId)}
                      title="Switch to this camera"
                      className={cn(
                        "p-1 rounded transition-colors",
                        activeCamera === guest.socketId ? "bg-indigo-500/20 text-indigo-400" : "hover:bg-white/10 text-white/40"
                      )}
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-white/5" />

          {/* Quick Simulcast Status */}
          <div>
            <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-2.5">Destinations</h3>
            <div className="space-y-1.5">
              {platforms.map(p => (
                <div key={p.id} className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: p.color + "20", color: p.color }}>
                      {p.icon}
                    </div>
                    <span className="text-white/60">{p.name}</span>
                  </div>
                  {p.status === "live" ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live
                    </span>
                  ) : p.enabled ? (
                    <Check className="w-3.5 h-3.5 text-white/40" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded border border-white/20" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ─── Center Canvas ─── */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 relative bg-[#08080a]">
          <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl border border-white/10 shadow-2xl shadow-black/50 relative overflow-hidden group">
            {/* Hidden video element for camera feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ display: canvasRef.current ? "none" : "block" }}
            />
            {/* WebGL filtered canvas */}
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover"
            />

            {/* Overlay Graphics Layer */}
            <OverlayRenderer overlays={overlays} />

            {/* AI Status Badges */}
            <div className="absolute top-3 right-3 flex gap-2">
              <AnimatePresence>
                {aiStatus === "ready" && (
                  <motion.span
                    key="ai-status"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-medium border border-white/10 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    AI Active
                  </motion.span>
                )}
                {isStreaming && (
                  <motion.span
                    key="rec-status"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="px-2.5 py-1 rounded-full bg-red-500/20 backdrop-blur-md text-[11px] font-medium border border-red-500/20 flex items-center gap-1.5 text-red-400"
                  >
                    <Radio className="w-3 h-3" />
                    REC
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* No Camera Placeholder */}
            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0f14] to-[#0a0a10]">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Camera className="w-10 h-10 text-white/20" />
                </div>
                <p className="text-white/40 text-sm">No camera connected</p>
                <button
                  onClick={setupCamera}
                  className="mt-3 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-medium transition-colors"
                >
                  Connect Camera
                </button>
              </div>
            )}
          </div>

          {/* ─── Guest PiP Tiles ─── */}
          {guests.length > 0 && (
            <div className="flex gap-2 mt-3 w-full max-w-5xl">
              {/* Host thumbnail */}
              <button
                onClick={() => setActiveCamera("host")}
                className={cn(
                  "relative w-32 aspect-video rounded-xl border-2 overflow-hidden transition-all cursor-pointer group",
                  activeCamera === "host"
                    ? "border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                    : "border-white/10 hover:border-white/30"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0a0a15] flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white/30" />
                </div>
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[9px] text-white/60 font-medium">
                  You (Host)
                </div>
              </button>
              {/* Guest thumbnails */}
              {guests.map((guest, i) => (
                <GuestTile
                  key={guest.socketId}
                  guest={guest}
                  index={i}
                  isActive={activeCamera === guest.socketId}
                  onClick={() => setActiveCamera(guest.socketId)}
                />
              ))}
            </div>
          )}

          {/* ─── Bottom Controls ─── */}
          <div className="absolute bottom-6 flex items-center gap-3 bg-white/[0.04] border border-white/10 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-2xl">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={cn(
                "p-2.5 rounded-xl transition-all",
                isMuted ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-white/10 hover:bg-white/15 text-white"
              )}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button
              onClick={setupCamera}
              className={cn(
                "p-2.5 rounded-xl transition-all",
                cameraActive ? "bg-white/10 hover:bg-white/15" : "bg-white/5 text-white/40"
              )}
            >
              <Camera className="w-5 h-5" />
            </button>
            <button className="p-2.5 bg-white/10 hover:bg-white/15 rounded-xl transition-colors">
              <Monitor className="w-5 h-5" />
            </button>

            <div className="w-px h-8 bg-white/10 mx-1" />

            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={cn(
                "px-7 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 text-sm",
                isStreaming
                  ? "bg-red-500/10 text-red-400 border border-red-500/40 hover:bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
              )}
            >
              {isStreaming ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  End Stream
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Go Live
                  {activePlatformCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded bg-white/20 text-[10px]">
                      {activePlatformCount}
                    </span>
                  )}
                </>
              )}
            </button>

            <div className="w-px h-8 bg-white/10 mx-1" />

            {/* Simulcast platform toggles */}
            <div className="flex gap-1.5">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => togglePlatform(p.id)}
                  className={cn(
                    "w-9 h-9 rounded-lg border flex items-center justify-center text-[10px] font-bold transition-all",
                    p.enabled
                      ? "opacity-100 border-white/20 shadow-lg"
                      : "opacity-40 border-white/5 hover:opacity-70"
                  )}
                  style={{
                    backgroundColor: p.enabled ? p.color + "20" : "transparent",
                    color: p.enabled ? p.color : undefined,
                    boxShadow: p.status === "live" ? `0 0 12px ${p.color}40` : undefined,
                  }}
                  title={p.name}
                >
                  {p.icon}
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* ─── Right Sidebar ─── */}
        <aside className="w-80 border-l border-white/5 bg-[#0a0a0c] flex flex-col z-10">
          <div className="flex p-1.5 gap-1 border-b border-white/5">
            {[
              { id: "ai", icon: Sparkles, label: "AI" },
              { id: "audio", icon: Volume2, label: "Audio" },
              { id: "editor", icon: Sliders, label: "Edit" },
              { id: "destinations", icon: Share2, label: "Dest" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all",
                  activeTab === tab.id
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:bg-white/5 hover:text-white/70"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <AnimatePresence mode="wait">
              {/* ─── AI Tab ─── */}
              {activeTab === "ai" && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  {/* AI Loading Banner */}
                  {aiStatus === "loading" && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-xs text-amber-300">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Loading MediaPipe AI models…
                    </div>
                  )}

                  <div>
                    <h3 className="text-xs font-semibold mb-3 flex items-center gap-2 text-white/70">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      Video Enhancement
                    </h3>
                    <div className="space-y-3">
                      <ToggleSetting label="Auto Lighting Correction" active={aiFeatures.autoLighting} onToggle={() => toggleAiFeature("autoLighting")} />
                      <ToggleSetting label="Studio Face Enhancement" active={aiFeatures.faceEnhancement} onToggle={() => toggleAiFeature("faceEnhancement")} />
                      <ToggleSetting label="Background Blur / Replace" active={aiFeatures.backgroundBlur} onToggle={() => toggleAiFeature("backgroundBlur")} />
                      <ToggleSetting label="Smart Auto-Framing" active={aiFeatures.autoFraming} onToggle={() => toggleAiFeature("autoFraming")} />
                    </div>
                  </div>

                  <div className="h-px bg-white/5" />

                  <div>
                    <h3 className="text-xs font-semibold mb-3 flex items-center gap-2 text-white/70">
                      <Gauge className="w-3.5 h-3.5 text-sky-400" />
                      Filter Adjustments
                    </h3>
                    <div className="space-y-3">
                      <SliderSetting label="Brightness" value={filters.brightness} min={-100} max={100} onChange={(v) => setFilters(f => ({ ...f, brightness: v }))} />
                      <SliderSetting label="Contrast" value={filters.contrast} min={-100} max={100} onChange={(v) => setFilters(f => ({ ...f, contrast: v }))} />
                      <SliderSetting label="Saturation" value={filters.saturation} min={-100} max={100} onChange={(v) => setFilters(f => ({ ...f, saturation: v }))} />
                      <SliderSetting label="Shadow Recovery" value={filters.shadowRecovery} min={0} max={100} onChange={(v) => setFilters(f => ({ ...f, shadowRecovery: v }))} />
                      <SliderSetting label="Noise Reduction" value={filters.noiseReduction} min={0} max={100} onChange={(v) => setFilters(f => ({ ...f, noiseReduction: v }))} />
                    </div>
                  </div>

                  <div className="h-px bg-white/5" />

                  <div>
                    <h3 className="text-xs font-semibold mb-3 flex items-center gap-2 text-white/70">
                      <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                      Audio AI
                    </h3>
                    <div className="space-y-3">
                      <ToggleSetting label="AI Noise Cancellation" active={aiFeatures.noiseCancellation} onToggle={() => toggleAiFeature("noiseCancellation")} />
                      <ToggleSetting label="Studio Voice EQ" active={aiFeatures.voiceEQ} onToggle={() => toggleAiFeature("voiceEQ")} />
                      <ToggleSetting label="Auto Volume Normalization" active={aiFeatures.autoVolume} onToggle={() => toggleAiFeature("autoVolume")} />
                      <ToggleSetting label="Echo Removal" active={aiFeatures.echoRemoval} onToggle={() => toggleAiFeature("echoRemoval")} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ─── Audio Tab ─── */}
              {activeTab === "audio" && (
                <motion.div
                  key="audio"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  <h3 className="text-xs font-semibold text-white/70">Audio Mixer</h3>
                  <AudioChannel label="Microphone" level={72} icon="mic" />
                  <AudioChannel label="Desktop Audio" level={35} icon="desktop" />
                  <AudioChannel label="Browser Source" level={0} icon="browser" />
                  <AudioChannel label="Media Player" level={50} icon="media" />
                  <div className="h-px bg-white/5" />
                  <div className="text-xs text-white/40 space-y-1">
                    <p>Output: 48kHz / 320kbps AAC</p>
                    <p>Channels: Stereo</p>
                  </div>
                </motion.div>
              )}

              {/* ─── Editor Tab ─── */}
              {activeTab === "editor" && (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  <h3 className="text-xs font-semibold text-white/70">Overlays & Graphics</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="p-3 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center gap-1.5 hover:bg-white/10 transition-colors">
                      <Type className="w-5 h-5 text-white/60" />
                      <span className="text-[11px] font-medium text-white/70">Text</span>
                    </button>
                    <button className="p-3 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center gap-1.5 hover:bg-white/10 transition-colors">
                      <ImageIcon className="w-5 h-5 text-white/60" />
                      <span className="text-[11px] font-medium text-white/70">Image</span>
                    </button>
                    <button className="p-3 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center gap-1.5 hover:bg-white/10 transition-colors">
                      <LayoutTemplate className="w-5 h-5 text-white/60" />
                      <span className="text-[11px] font-medium text-white/70">Lower Third</span>
                    </button>
                    <button className="p-3 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center gap-1.5 hover:bg-white/10 transition-colors">
                      <Contrast className="w-5 h-5 text-white/60" />
                      <span className="text-[11px] font-medium text-white/70">Filter</span>
                    </button>
                  </div>

                  <div className="h-px bg-white/5" />

                  <h3 className="text-xs font-semibold text-white/70">Active Overlays</h3>
                  <div className="space-y-2">
                    {overlays.map(o => (
                      <div key={o.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 text-sm">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", o.visible ? "bg-emerald-400" : "bg-white/20")} />
                          <span className="text-white/80 text-xs">{o.content}</span>
                        </div>
                        <button
                          onClick={() => toggleOverlay(o.id)}
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded font-medium transition-colors",
                            o.visible ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/40 hover:text-white/60"
                          )}
                        >
                          {o.visible ? "ON" : "OFF"}
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ─── Destinations Tab ─── */}
              {activeTab === "destinations" && (
                <motion.div
                  key="destinations"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  <h3 className="text-xs font-semibold text-white/70">Simulcast Destinations</h3>
                  <div className="space-y-2">
                    {platforms.map(p => (
                      <div key={p.id} className="flex items-center justify-between px-3 py-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                            style={{ backgroundColor: p.color + "15", color: p.color }}
                          >
                            {p.icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{p.name}</p>
                            <p className="text-[11px] text-white/40">
                              {p.status === "live" ? "Broadcasting" : p.enabled ? "Ready" : "Not configured"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {p.status === "live" && (
                            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              LIVE
                            </span>
                          )}
                          <button
                            onClick={() => togglePlatform(p.id)}
                            className={cn(
                              "w-9 h-5 rounded-full transition-colors relative",
                              p.enabled ? "bg-indigo-500" : "bg-white/10"
                            )}
                          >
                            <div className={cn(
                              "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm",
                              p.enabled ? "translate-x-4" : "translate-x-0"
                            )} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-2.5 rounded-lg border border-dashed border-white/15 text-white/40 hover:text-white/60 hover:border-white/25 text-xs transition-colors">
                    + Add Custom RTMP Endpoint
                  </button>

                  <div className="h-px bg-white/5" />

                  <div>
                    <h3 className="text-xs font-semibold text-white/70 mb-3">Stream Settings</h3>
                    <div className="space-y-2 text-xs text-white/50">
                      <div className="flex justify-between"><span>Resolution</span><span className="text-white/70">1920×1080</span></div>
                      <div className="flex justify-between"><span>Framerate</span><span className="text-white/70">30 fps</span></div>
                      <div className="flex justify-between"><span>Bitrate</span><span className="text-white/70">6000 kbps</span></div>
                      <div className="flex justify-between"><span>Encoder</span><span className="text-white/70">H.264 (Hardware)</span></div>
                      <div className="flex justify-between"><span>Audio</span><span className="text-white/70">AAC 320kbps</span></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ─── Sub-Components ─── */

function ToggleSetting({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer" onClick={onToggle}>
      <span className="text-xs text-white/70 group-hover:text-white transition-colors">{label}</span>
      <div className={cn(
        "w-8 h-[18px] rounded-full transition-colors relative",
        active ? "bg-indigo-500" : "bg-white/10"
      )}>
        <div className={cn(
          "absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform shadow-sm",
          active ? "translate-x-[14px]" : "translate-x-0"
        )} />
      </div>
    </div>
  );
}

function SliderSetting({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/60">{label}</span>
        <span className="text-[10px] text-white/40 font-mono">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer bg-white/10
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-400
          [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(99,102,241,0.5)]
          [&::-webkit-slider-thumb]:hover:bg-indigo-300"
      />
    </div>
  );
}

function AudioChannel({ label, level, icon }: { label: string; level: number; icon: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/70">{label}</span>
        <span className="text-[10px] text-white/30 font-mono">{level > 0 ? `-${(100 - level) * 0.5}dB` : "−∞"}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${level}%` }}
          transition={{ type: "spring", damping: 15 }}
          style={{
            background: level > 80 ? "linear-gradient(to right, #22c55e, #f59e0b, #ef4444)"
              : level > 0 ? "linear-gradient(to right, #22c55e, #22c55e)"
              : "transparent"
          }}
        />
      </div>
    </div>
  );
}
