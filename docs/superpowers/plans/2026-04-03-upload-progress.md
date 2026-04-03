# Upload Progress Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在首頁上傳檔案時顯示環形進度指示器，提供即時上傳進度回饋。

**Architecture:** 新建 `UploadProgress` 元件負責環形 SVG 渲染和動畫，修改 `page.tsx` 的上傳邏輯用 axios `onUploadProgress` 取得真實進度，透過 state 驅動元件顯示/隱藏。

**Tech Stack:** React, framer-motion (已安裝), axios (已安裝), SVG

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/upload-progress.tsx` | Create | 環形進度 UI 元件 |
| `src/app/page.tsx` | Modify | 上傳邏輯加入進度追蹤，整合進度元件 |

---

### Task 1: 建立 UploadProgress 元件

**Files:**
- Create: `src/components/upload-progress.tsx`

- [ ] **Step 1: 建立元件檔案**

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";

interface UploadProgressProps {
  progress: number;
  filename: string;
  status: "uploading" | "done" | "error";
}

const RADIUS = 24;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function UploadProgress({
  progress,
  filename,
  status,
}: UploadProgressProps) {
  const offset = CIRCUMFERENCE * (1 - progress / 100);

  const ringColor =
    status === "done"
      ? "#22c55e"
      : status === "error"
        ? "#ef4444"
        : "#3b82f6";

  const statusText =
    status === "done"
      ? "Done"
      : status === "error"
        ? "Failed"
        : "Uploading...";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4"
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
          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-blue-500">
            {status === "done" ? (
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
            ) : status === "error" ? (
              <span className="text-red-500">!</span>
            ) : (
              <span style={{ color: ringColor }}>{Math.round(progress)}%</span>
            )}
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
```

- [ ] **Step 2: 驗證 TypeScript 編譯**

Run: `pnpm typecheck`
Expected: 無錯誤

- [ ] **Step 3: Commit**

```bash
git add src/components/upload-progress.tsx
git commit -m "feat: add UploadProgress circular progress component"
```

---

### Task 2: 修改 page.tsx — 整合上傳進度

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 加入 import 和新 state**

在 `src/app/page.tsx` 頂部加入 import：

```tsx
import UploadProgress from "~/components/upload-progress";
```

在 `Home` 元件內，現有的 state 宣告（`creating`, `selectedFile`, `content`）後面加入：

```tsx
const [uploadProgress, setUploadProgress] = useState(0);
const [uploadStatus, setUploadStatus] = useState<
  "idle" | "uploading" | "done" | "error"
>("idle");
```

- [ ] **Step 2: 改寫 uploadFile 函式**

將現有的 `uploadFile` 函式替換為：

```tsx
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
```

- [ ] **Step 3: 修改 onClick handler — 加入狀態管理**

將 Add 按鈕的 `onClick` handler 替換為：

```tsx
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
```

- [ ] **Step 4: 加入 UploadProgress 到 JSX**

在 `</motion.div>` (包含 Add 按鈕的那個) 和 `<motion.div layout>` (包含 Separator 的那個) 之間，加入：

```tsx
<AnimatePresence>
  {uploadStatus !== "idle" && selectedFile && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mx-auto max-w-5xl px-3"
    >
      <UploadProgress
        progress={uploadProgress}
        filename={selectedFile.name}
        status={uploadStatus === "idle" ? "uploading" : uploadStatus}
      />
    </motion.div>
  )}
</AnimatePresence>
```

同時在檔案頂部加入 `AnimatePresence` 的 import：

```tsx
import { motion, AnimatePresence } from "framer-motion";
```

（取代現有的 `import { motion } from "framer-motion";`）

- [ ] **Step 5: 驗證**

Run: `pnpm check`
Expected: 無錯誤

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: integrate upload progress bar with circular indicator"
```

---

### Task 3: 手動測試驗證

- [ ] **Step 1: 啟動 dev server**

Run: `pnpm dev`

- [ ] **Step 2: 驗證上傳進度**

1. 開啟 http://localhost:3000
2. 拖拽或選擇一個檔案（建議用較大檔案以看到進度變化）
3. 按 Add
4. 確認：環形進度圈出現，百分比增長，完成後顯示綠色打勾，1 秒後消失
5. 確認：Post 正常建立

- [ ] **Step 3: 驗證錯誤狀態**

1. 暫時停掉 server 或修改 upload API URL 造成錯誤
2. 選檔案按 Add
3. 確認：進度圈變紅色顯示 "Failed"，2 秒後消失

- [ ] **Step 4: 確認純文字 post 不顯示進度**

1. 不選檔案，只輸入文字
2. 按 Add
3. 確認：沒有進度圈出現

- [ ] **Step 5: Commit docs**

```bash
git add docs/superpowers/specs/2026-04-03-upload-progress-design.md docs/superpowers/plans/2026-04-03-upload-progress.md
git commit -m "docs: add upload progress bar spec and plan"
```
