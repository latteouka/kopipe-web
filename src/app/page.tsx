"use client";

import { api } from "~/trpc/react";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");

  const posts = api.post.findMany.useQuery();
  const create = api.post.create.useMutation();
  const deletePost = api.post.deletePost.useMutation();

  return (
    <main className="min-h-screen bg-gray-50 px-10">
      <div className="flex flex-col gap-4 p-3">
        <Label>Kopipe</Label>
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="h-32"
        />
        <div className="flex justify-end">
          <Button
            onClick={async () => {
              await create.mutateAsync({ content });
              await posts.refetch();
              setContent("");
            }}
          >
            Add
          </Button>
        </div>
      </div>

      <Separator />

      <div className="mt-3 flex flex-col gap-6 p-3">
        {posts.data?.posts.map((post) => {
          return (
            <div key={post.id} className="flex justify-between gap-2">
              <CopyToClipboard
                text={post.content}
                onCopy={() => toast.success("Copied!")}
              >
                <div className="flex-1 whitespace-pre-line rounded-md border border-gray-200 bg-white p-6 text-sm">
                  {post.content}
                </div>
              </CopyToClipboard>

              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  const toastId = toast.loading("刪除中");
                  await deletePost.mutateAsync({ id: post.id });
                  await posts.refetch();
                  toast.dismiss(toastId);
                  toast.success("刪除完畢");
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </main>
  );
}
