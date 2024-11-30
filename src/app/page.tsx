"use client";

import { api } from "~/trpc/react";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

import { toast } from "sonner";

import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import PostItem from "~/components/post-item";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { X } from "lucide-react";
import cn from "classnames";
import { motion } from "framer-motion";

dayjs.extend(relativeTime);

export default function Home() {
  const [creating, setCreating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [content, setContent] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const posts = api.post.findMany.useQuery();
  const create = api.post.create.useMutation();

  const uploadFile = async (): Promise<string> => {
    if (!selectedFile) throw new Error();
    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await axios.post<{ success: boolean; name?: string }>(
      "/api/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    if (!response.data.name) throw new Error();
    return response.data.name;
  };

  const clearFile = () => {
    setSelectedFile(null);
  };

  useEffect(() => {
    toast.warning(
      "All posts and files will be automatically deleted after 3 hours.",
    );
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 p-3">
        <Label>kopipe</Label>
        <div className="flex gap-3">
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="h-32"
          />
          <div
            {...getRootProps()}
            className={cn(
              isDragActive
                ? "border-gray-500 text-gray-500"
                : "border-gray-300 text-gray-400",
              "m-1 flex w-64 cursor-pointer items-center justify-center rounded-md border-2 border-dashed p-2",
            )}
          >
            <input {...getInputProps()} />
            {isDragActive ? <p>Drop!!</p> : <p>Drag or Click</p>}
          </div>
        </div>

        {selectedFile?.name && (
          <div className="flex items-center gap-3 px-1 text-gray-600">
            <div>{selectedFile.name}</div>
            <X
              size={16}
              onClick={() => clearFile()}
              className="cursor-pointer transition-all duration-300 hover:text-gray-400"
            />
          </div>
        )}

        <motion.div className="flex justify-end" layout>
          <Button
            disabled={creating}
            onClick={async () => {
              setCreating(true);
              try {
                let filename: string | undefined;
                if (!content && !selectedFile) return;

                if (selectedFile) {
                  filename = await uploadFile();
                }

                await create.mutateAsync({ content, filename });
                await posts.refetch();
                setContent("");
                setSelectedFile(null);
                setCreating(false);
              } catch (error) {
                console.log(error);
                setCreating(false);
              }
            }}
          >
            Add
          </Button>
        </motion.div>
      </div>

      <motion.div layout>
        <Separator />
      </motion.div>

      <motion.div
        className="mx-auto mt-3 flex max-w-5xl flex-col gap-6 p-3"
        layout
      >
        {posts.data?.posts.map((post) => {
          return <PostItem key={post.id} post={post} />;
        })}
      </motion.div>
    </main>
  );
}
