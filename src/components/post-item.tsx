import { type Post } from "@prisma/client";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "sonner";
import { Copy, Download, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import { env } from "~/env";
import axios from "axios";

dayjs.extend(relativeTime);

interface Props {
  post: Post;
}

const PostItem = ({ post }: Props) => {
  const [disabled, setDisabled] = useState(false);
  const posts = api.post.findMany.useQuery();
  const deletePost = api.post.deletePost.useMutation();
  console.log(post);

  const deleteFile = async () => {
    const response = await axios.post<{ success: boolean; message: string }>(
      "/api/delete",
      {
        filename: post.filename,
      },
    );
  };
  return (
    <motion.div className="flex justify-between gap-2" layout>
      <span className="flex flex-1 flex-col justify-center whitespace-pre-wrap break-all rounded-md border border-gray-200 bg-white p-6 text-sm text-gray-700">
        {post.content === "" ? post.filename : post.content}
        <span className="flex w-full justify-end text-gray-400">
          {dayjs(post.createdAt).fromNow()}
        </span>
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

        {post.filename && (
          <a
            href={`${env.NEXT_PUBLIC_BASE_URL}/${post.filename}`}
            target="_blank"
          >
            <Button variant="ghost" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </a>
        )}

        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          onClick={async () => {
            setDisabled(true);
            const toastId = toast.loading("刪除中");
            await deleteFile();
            await deletePost.mutateAsync({ id: post.id });
            await posts.refetch();
            toast.dismiss(toastId);
            toast.success("刪除完畢");
            setDisabled(false);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};
export default PostItem;
