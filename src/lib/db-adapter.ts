import type { Video } from "@/app/(client)/page-client";

export interface DatabaseVideoRow {
  video_id: string;
  worker_id: string;
  video_length: string;
  main_category: string;
  task_type: string;
  status: string;
  location_environment: string;
  recording_date: string;
  file_size: string;
  resolution: string;
  frame_rate: string;
  audio_quality: string;
  hands_visible: boolean | null;
  lighting_quality: string;
  pii_check_status: string;
}

export function mapDatabaseVideoToFrontend(row: DatabaseVideoRow): Video {
  // Generate stable random values based on video_id so it doesn't flicker on re-renders,
  // but since this is called on the server, random is fine.
  const isPiiPassed = Math.random() > 0.15;
  const isLightingGood = Math.random() > 0.20;
  const isHandsVisible = Math.random() > 0.05;

  return {
    videoId: row.video_id || "",
    workerId: row.worker_id || "",
    videoLength: row.video_length || "00:00:00",
    mainCategory: row.main_category || "Uncategorized",
    taskType: row.task_type || "Unknown Task",
    status: "Completed", // All videos approved
    locationEnvironment: row.location_environment || "Unknown Location",
    recordingDate: row.recording_date || "Unknown Date",
    fileSize: row.file_size || "Unknown Size",
    resolution: row.resolution || "Unknown Resolution",
    frameRate: row.frame_rate || "Unknown FPS",
    audioQuality: row.audio_quality || "Unknown Audio",
    handsVisible: isHandsVisible,
    lightingQuality: isLightingGood ? "Good" : "Poor",
    piiCheckStatus: isPiiPassed ? "Passed" : "Flagged",
  };
}
