import type { Video } from "@/app/page-client";

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
  return {
    videoId: row.video_id || "",
    workerId: row.worker_id || "",
    videoLength: row.video_length || "00:00:00",
    mainCategory: row.main_category || "Uncategorized",
    taskType: row.task_type || "Unknown Task",
    status: (row.status as Video["status"]) || "Pending",
    locationEnvironment: row.location_environment || "Unknown Location",
    recordingDate: row.recording_date || "Unknown Date",
    fileSize: row.file_size || "Unknown Size",
    resolution: row.resolution || "Unknown Resolution",
    frameRate: row.frame_rate || "Unknown FPS",
    audioQuality: row.audio_quality || "Unknown Audio",
    handsVisible: Boolean(row.hands_visible),
    lightingQuality: row.lighting_quality || "Unknown Lighting",
    piiCheckStatus: (row.pii_check_status as Video["piiCheckStatus"]) || "Pending",
  };
}
