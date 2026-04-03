export const RADIUS = 24;
export const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export type UploadStatus = "uploading" | "done" | "error";

export const RING_COLORS: Record<UploadStatus, string> = {
  done: "#22c55e",
  error: "#ef4444",
  uploading: "#3b82f6",
};

export const STATUS_TEXTS: Record<UploadStatus, string> = {
  done: "Done",
  error: "Failed",
  uploading: "Uploading...",
};

export function calculateOffset(progress: number): number {
  return CIRCUMFERENCE * (1 - progress / 100);
}
