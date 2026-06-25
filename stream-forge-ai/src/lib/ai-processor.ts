import { FaceLandmarker, FilesetResolver, ImageSegmenter } from '@mediapipe/tasks-vision';

let faceLandmarker: FaceLandmarker | null = null;
let imageSegmenter: ImageSegmenter | null = null;
let isInitializing = false;
let isInitialized = false;

export async function initializeAIModels(): Promise<boolean> {
  if (isInitialized) return true;
  if (isInitializing) return false;
  isInitializing = true;

  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm"
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task`,
        delegate: "GPU"
      },
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
      numFaces: 1
    });

    imageSegmenter = await ImageSegmenter.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite`,
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      outputCategoryMask: true,
      outputConfidenceMasks: false
    });

    isInitialized = true;
    console.log("MediaPipe AI models loaded.");
    return true;
  } catch (error) {
    console.error("Failed to initialize MediaPipe models:", error);
    return false;
  } finally {
    isInitializing = false;
  }
}

export function getFaceLandmarker() {
  return faceLandmarker;
}

export function getImageSegmenter() {
  return imageSegmenter;
}

export function isAIReady() {
  return isInitialized;
}
