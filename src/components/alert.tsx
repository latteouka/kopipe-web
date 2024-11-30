"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import useLocalStorageState from "use-local-storage-state";

const Alert = () => {
  const [status, setStatus] = useLocalStorageState("status", {
    defaultValue: {
      version: 2,
      showed: false,
    },
  });

  useEffect(() => {
    console.log(status);
  }, [status.showed]);

  return <div />;
};
export default Alert;
