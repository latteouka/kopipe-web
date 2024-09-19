"use client";

import { api } from "~/trpc/react";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "sonner";
import { Copy, Trash2 } from "lucide-react";

import { useEffect, useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");

  const posts = api.post.findMany.useQuery();
  const create = api.post.create.useMutation();
  const deletePost = api.post.deletePost.useMutation();

  useEffect(() => {
    toast.warning("The data will be automatically deleted after a hour.");
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 p-3">
        <Label>kopipe</Label>
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

      <div className="mx-auto mt-3 flex max-w-5xl flex-col gap-6 p-3">
        {posts.data?.posts.map((post) => {
          return (
            <div key={post.id} className="flex justify-between gap-2">
              <span className="flex flex-1 items-center whitespace-pre-wrap rounded-md border border-gray-200 bg-white p-6 text-sm">
                {post.content}
              </span>

              <div className="flex flex-col">
                <CopyToClipboard
                  text={post.content}
                  onCopy={() => {
                    toast.success("Copied!");
                  }}
                >
                  <Button variant="ghost" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
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
            </div>
          );
        })}
      </div>
    </main>
  );
}
