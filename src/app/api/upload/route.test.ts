import { describe, it, expect, afterAll, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";

// 建立真實的暫存目錄，用於實際檔案寫入測試
const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), "kopipe-upload-test-"));

vi.mock("~/env", () => ({
  env: {
    UPLOAD_DIR: tmpBase,
  },
}));

// mock 必須在 import route 之前宣告，因此動態 import 放在測試內部
async function getHandler() {
  const { POST } = await import("./route");
  return POST;
}

function makeRequest(formData: FormData): NextRequest {
  return new NextRequest("http://localhost/api/upload", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/upload", () => {
  afterAll(() => {
    fs.rmSync(tmpBase, { recursive: true, force: true });
  });

  it("formData 沒有 file 時回傳 success: false", async () => {
    const POST = await getHandler();
    const formData = new FormData();
    const req = makeRequest(formData);

    const res = await POST(req);
    const body = await res.json() as { success: boolean };

    expect(body.success).toBe(false);
  });

  it("成功上傳檔案並寫入磁碟", async () => {
    const POST = await getHandler();

    const content = "hello kopipe";
    const file = new File([content], "test-upload.txt", { type: "text/plain" });
    const formData = new FormData();
    formData.append("file", file);

    const req = makeRequest(formData);
    const res = await POST(req);
    const body = await res.json() as { success: boolean; name: string };

    expect(body.success).toBe(true);
    expect(body.name).toBe("test-upload.txt");

    const writtenPath = path.join(tmpBase, "test-upload.txt");
    expect(fs.existsSync(writtenPath)).toBe(true);

    const written = fs.readFileSync(writtenPath, "utf-8");
    expect(written).toBe(content);
  });

  it("上傳目錄不存在時自動建立目錄", async () => {
    // 建立一個尚未存在的子目錄作為 UPLOAD_DIR
    const nestedDir = path.join(tmpBase, "nested", "upload");

    vi.doMock("~/env", () => ({
      env: {
        UPLOAD_DIR: nestedDir,
      },
    }));

    // 重新 import 以取得使用新 mock 的 handler
    vi.resetModules();
    const { POST } = await import("./route");

    expect(fs.existsSync(nestedDir)).toBe(false);

    const file = new File(["dir creation test"], "dir-test.txt", {
      type: "text/plain",
    });
    const formData = new FormData();
    formData.append("file", file);

    const req = makeRequest(formData);
    await POST(req);

    expect(fs.existsSync(nestedDir)).toBe(true);
    expect(fs.existsSync(path.join(nestedDir, "dir-test.txt"))).toBe(true);

    // 恢復原始 mock 以免影響其他測試
    vi.doMock("~/env", () => ({
      env: {
        UPLOAD_DIR: tmpBase,
      },
    }));
    vi.resetModules();
  });
});
