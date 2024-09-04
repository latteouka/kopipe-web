"use client";

import { LoadingPageDot } from "~/components/loading";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "sonner";

const Meet = () => {
  const create = api.meet.getLink.useMutation();
  return (
    <div className="flex max-w-5xl flex-col items-center justify-center gap-3">
      {!create.isPending && !create.data && (
        <Button onClick={async () => await create.mutateAsync()}>
          Create Link
        </Button>
      )}
      {create.isPending && <LoadingPageDot />}
      {create.isError && (
        <div className="text-red-400">{create.error.message}</div>
      )}
      {create.data && (
        <CopyToClipboard
          text={create.data.url}
          onCopy={() => toast.success("已複製！")}
        >
          <div className="cursor-pointer">{create.data.url}</div>
        </CopyToClipboard>
      )}
    </div>
  );
};
export default Meet;
