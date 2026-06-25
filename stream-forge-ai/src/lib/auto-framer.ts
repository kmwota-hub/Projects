export interface FrameRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AutoFrameState {
  targetRect: FrameRect;
  currentRect: FrameRect;
  smoothing: number; // 0-1, higher = smoother/slower
}

export function createAutoFrameState(videoWidth: number, videoHeight: number): AutoFrameState {
  const fullFrame: FrameRect = { x: 0, y: 0, width: videoWidth, height: videoHeight };
  return {
    targetRect: { ...fullFrame },
    currentRect: { ...fullFrame },
    smoothing: 0.92,
  };
}

export function updateAutoFrame(
  state: AutoFrameState,
  faceBoundingBox: { originX: number; originY: number; width: number; height: number } | null,
  videoWidth: number,
  videoHeight: number
): FrameRect {
  if (!faceBoundingBox) {
    // No face detected - smoothly zoom out to full frame
    state.targetRect = { x: 0, y: 0, width: videoWidth, height: videoHeight };
  } else {
    // Calculate a crop region centered on the face with padding
    const faceCenterX = (faceBoundingBox.originX + faceBoundingBox.width / 2) * videoWidth;
    const faceCenterY = (faceBoundingBox.originY + faceBoundingBox.height / 2) * videoHeight;
    const faceSize = Math.max(faceBoundingBox.width * videoWidth, faceBoundingBox.height * videoHeight);
    
    // Add generous padding around the face (3x the face size)
    const padding = faceSize * 1.5;
    const cropSize = Math.max(faceSize + padding * 2, Math.min(videoWidth, videoHeight) * 0.5);
    
    // Maintain aspect ratio
    const aspectRatio = videoWidth / videoHeight;
    let cropWidth = cropSize * aspectRatio;
    let cropHeight = cropSize;
    
    // Clamp to video bounds
    cropWidth = Math.min(cropWidth, videoWidth);
    cropHeight = Math.min(cropHeight, videoHeight);
    
    let x = faceCenterX - cropWidth / 2;
    let y = faceCenterY - cropHeight / 2;
    
    // Keep within bounds
    x = Math.max(0, Math.min(x, videoWidth - cropWidth));
    y = Math.max(0, Math.min(y, videoHeight - cropHeight));
    
    state.targetRect = { x, y, width: cropWidth, height: cropHeight };
  }

  // Smooth interpolation
  const s = state.smoothing;
  state.currentRect = {
    x: state.currentRect.x * s + state.targetRect.x * (1 - s),
    y: state.currentRect.y * s + state.targetRect.y * (1 - s),
    width: state.currentRect.width * s + state.targetRect.width * (1 - s),
    height: state.currentRect.height * s + state.targetRect.height * (1 - s),
  };

  return state.currentRect;
}
