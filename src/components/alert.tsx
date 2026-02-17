"use client";

import { useEffect } from "react";
import useLocalStorageState from "use-local-storage-state";

const Alert = () => {
  const [status] = useLocalStorageState("status", {
    defaultValue: {
      version: 2,
      showed: false,
    },
  });

  useEffect(() => {
    console.log(status);
  }, [status]);

  return <div />;
};
export default Alert;
