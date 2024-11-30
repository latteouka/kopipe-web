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
    if (status.version < 2) {
      setStatus({
        ...status,
        version: 2,
      });
    }

    if (!status.showed) {
      toast.info("已更新上傳檔案功能");
      setStatus({
        ...status,
        showed: true,
      });
    }
  }, []);
  return <div></div>;
};
export default Alert;
