"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  RADIUS,
  CIRCUMFERENCE,
  RING_COLORS,
  STATUS_TEXTS,
  calculateOffset,
  type UploadStatus,
} from "./upload-progress-utils";

interface UploadProgressProps {
  progress: number;
  filename: string;
  status: UploadStatus;
}

export default function UploadProgress({
  progress,
  filename,
  status,
}: Readonly<UploadProgressProps>) {
  const offset = calculateOffset(progress);
  const ringColor = RING_COLORS[status];
  const statusText = STATUS_TEXTS[status];

  function renderCenterIcon() {
    if (status === "done") {
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#22c55e"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    }
    if (status === "error") {
      return <span className="text-red-500">!</span>;
    }
    return (
      <span style={{ color: ringColor }}>{Math.round(progress)}%</span>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-gray-100"
      >
        <div className="relative h-14 w-14">
          <svg
            width="56"
            height="56"
            viewBox="0 0 56 56"
            className="-rotate-90"
          >
            <circle
              cx="28"
              cy="28"
              r={RADIUS}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="4"
            />
            <circle
              cx="28"
              cy="28"
              r={RADIUS}
              fill="none"
              stroke={ringColor}
              strokeWidth="4"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
            {renderCenterIcon()}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-800">{filename}</div>
          <div className="text-xs text-gray-400">{statusText}</div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
