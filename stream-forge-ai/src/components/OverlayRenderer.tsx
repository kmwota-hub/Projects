"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface OverlayItem {
  id: string;
  type: "lower-third" | "text" | "logo" | "caption";
  content: string;
  subtitle?: string;
  position: { x: number; y: number };
  visible: boolean;
  style?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    opacity?: number;
  };
}

const defaultOverlays: OverlayItem[] = [
  {
    id: "lt-1",
    type: "lower-third",
    content: "StreamForge AI Demo",
    subtitle: "Next-Gen Livestreaming Platform",
    position: { x: 40, y: 75 },
    visible: true,
    style: {
      backgroundColor: "rgba(99, 102, 241, 0.9)",
      textColor: "#ffffff",
    },
  },
  {
    id: "cap-1",
    type: "caption",
    content: "AI-powered captions appear here in real time",
    position: { x: 50, y: 90 },
    visible: false,
    style: {
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      textColor: "#ffffff",
      fontSize: 16,
    },
  },
];

export function OverlayRenderer({ overlays = defaultOverlays }: { overlays?: OverlayItem[] }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {overlays.filter(o => o.visible).map((overlay) => (
          <OverlayElement key={overlay.id} overlay={overlay} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function OverlayElement({ overlay }: { overlay: OverlayItem }) {
  if (overlay.type === "lower-third") {
    return (
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -100, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 150 }}
        className="absolute"
        style={{
          left: `${overlay.position.x}px`,
          bottom: `${100 - overlay.position.y}%`,
        }}
      >
        <div className="flex items-stretch">
          <div
            className="w-1.5 rounded-l-md"
            style={{ backgroundColor: overlay.style?.backgroundColor || "#6366f1" }}
          />
          <div className="bg-black/80 backdrop-blur-md px-5 py-3 rounded-r-md border border-white/10">
            <p
              className="font-bold text-base"
              style={{ color: overlay.style?.textColor || "#fff" }}
            >
              {overlay.content}
            </p>
            {overlay.subtitle && (
              <p className="text-white/60 text-sm mt-0.5">{overlay.subtitle}</p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (overlay.type === "caption") {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="absolute left-1/2 -translate-x-1/2"
        style={{ bottom: `${100 - overlay.position.y}%` }}
      >
        <div
          className="px-6 py-2.5 rounded-lg"
          style={{
            backgroundColor: overlay.style?.backgroundColor || "rgba(0,0,0,0.75)",
            color: overlay.style?.textColor || "#fff",
            fontSize: overlay.style?.fontSize || 16,
          }}
        >
          {overlay.content}
        </div>
      </motion.div>
    );
  }

  if (overlay.type === "text") {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="absolute"
        style={{
          left: `${overlay.position.x}%`,
          top: `${overlay.position.y}%`,
          color: overlay.style?.textColor || "#fff",
          fontSize: overlay.style?.fontSize || 24,
          opacity: overlay.style?.opacity || 1,
        }}
      >
        <span className="font-bold drop-shadow-lg">{overlay.content}</span>
      </motion.div>
    );
  }

  return null;
}

export { defaultOverlays };
