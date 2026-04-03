"use client";

import { api } from "~/trpc/react";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

import { toast } from "sonner";

import { useState, useCallback } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import PostItem from "~/components/post-item";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { X } from "lucide-react";
import cn from "classnames";
import { motion, AnimatePresence } from "framer-motion";
import Alert from "~/components/alert";
import UploadProgress from "~/components/upload-progress";

dayjs.extend(relativeTime);

export default function Home() {
  const [creating, setCreating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [content, setContent] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "done" | "error"
  >("idle");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const posts = api.post.findMany.useQuery();
  const create = api.post.create.useMutation();

  const uploadFile = async (): Promise<string> => {
    if (!selectedFile) throw new Error("No file selected");
    const formData = new FormData();
    formData.append("file", selectedFile);

    setUploadStatus("uploading");
    setUploadProgress(0);

    const response = await axios.post<{ success: boolean; name?: string }>(
      "/api/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setUploadProgress(percent);
          }
        },
      },
    );

    if (!response.data.name) throw new Error("Upload failed: no filename returned");
    return response.data.name;
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-5 pb-6 pt-10">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-800">
          kopipe
        </h1>
        <div className="flex gap-4">
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="h-36 flex-1 resize-none rounded-xl border-gray-200 bg-white shadow-sm transition-colors focus-visible:border-gray-300"
            placeholder="Paste something..."
          />
          <div
            {...getRootProps()}
            className={cn(
              isDragActive
                ? "border-blue-400 bg-blue-50/50 text-blue-500"
                : "border-gray-200 bg-white text-gray-400 hover:border-gray-300 hover:text-gray-500",
              "flex w-48 shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed shadow-sm transition-all",
            )}
          >
            <input {...getInputProps()} />
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-60"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-xs">{isDragActive ? "Drop!" : "Upload file"}</p>
          </div>
        </div>

        {selectedFile?.name && (
          <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="shrink-0"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="flex-1 truncate">{selectedFile.name}</span>
            <X
              size={14}
              onClick={() => clearFile()}
              className="shrink-0 cursor-pointer rounded-full p-0.5 transition-colors hover:bg-gray-200 hover:text-gray-500"
            />
          </div>
        )}

        <motion.div className="flex items-center justify-end gap-3" layout>
          <Button
            disabled={creating}
            className="rounded-lg px-6"
            onClick={async () => {
              setCreating(true);
              try {
                let filename: string | undefined;
                if (!content && !selectedFile) {
                  toast.error("Input content or upload a file.");
                  setCreating(false);
                  return;
                }

                if (selectedFile) {
                  filename = await uploadFile();
                  setUploadStatus("done");
                  await new Promise((r) => setTimeout(r, 1000));
                  setUploadStatus("idle");
                }

                await create.mutateAsync({ content, filename });
                await posts.refetch();
                setContent("");
                setSelectedFile(null);
                setCreating(false);
              } catch (error) {
                console.log(error);
                if (uploadStatus !== "idle") {
                  setUploadStatus("error");
                  setTimeout(() => setUploadStatus("idle"), 2000);
                }
                setCreating(false);
              }
            }}
          >
            Add
          </Button>
        </motion.div>
      </div>

      <AnimatePresence>
        {uploadStatus !== "idle" && selectedFile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-auto max-w-3xl pb-4"
          >
            <UploadProgress
              progress={uploadProgress}
              filename={selectedFile.name}
              status={uploadStatus}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-3xl py-1">
        <Separator className="bg-gray-200/80" />
      </div>

      <motion.div
        className="mx-auto flex max-w-3xl flex-col gap-4 py-6"
        layout
      >
        {posts.data?.posts.map((post) => {
          return <PostItem key={post.id} post={post} />;
        })}
      </motion.div>
      <Alert />
    </main>
  );
}
