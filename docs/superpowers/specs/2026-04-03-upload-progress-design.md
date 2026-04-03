# Upload Progress Bar 設計

**Created**: 2026-04-03

## Overview

在首頁上傳檔案時，顯示環形進度指示器（Circular Progress），提供即時上傳進度回饋。

## 視覺設計

採用 Circular Progress 風格：
- 56px 環形 SVG 進度圈，藍色 (`#3b82f6`) 進度弧線
- 百分比數字在圓圈中央
- 右側顯示檔名 + 狀態文字（"Uploading..."、"Done"、"Failed"）
- 使用 framer-motion 做進場/離場動畫，與現有頁面風格一致

## 元件架構

### 新建 `src/components/upload-progress.tsx`

```tsx
interface UploadProgressProps {
  progress: number;    // 0-100
  filename: string;
  status: "uploading" | "done" | "error";
}
```

- 環形 SVG：`stroke-dasharray` = 圓周長，`stroke-dashoffset` = 圓周長 × (1 - progress/100)
- status="done" 時圓圈變綠色 + 打勾圖示
- status="error" 時圓圈變紅色
- 用 `AnimatePresence` + `motion.div` 控制進場/離場

### 修改 `src/app/page.tsx`

**上傳邏輯：**
- 使用 axios 的 `onUploadProgress` callback 取得真實上傳進度
- 新增 state：
  - `uploadProgress: number`（0-100）
  - `uploadStatus: "idle" | "uploading" | "done" | "error"`

**流程：**
1. 按 Add → 有檔案時 `uploadStatus = "uploading"`
2. axios `onUploadProgress` 更新 `uploadProgress`
3. 上傳成功 → `uploadStatus = "done"`，等 1 秒後 → `uploadStatus = "idle"`
4. 上傳失敗 → `uploadStatus = "error"`，等 2 秒後 → `uploadStatus = "idle"`

**進度 bar 位置：**
- 在 Add 按鈕和 Separator 之間，`uploadStatus !== "idle"` 時顯示

## 不包含的項目

- 取消上傳功能
- 多檔案同時上傳
- 拖拽時的進度預覽
- 檔案大小顯示（目前 upload API 沒回傳大小資訊，且 File 物件可直接取得，但保持簡單不加）
