// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";

// 建立暫時目錄，供所有測試使用
let tmpDir: string;

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kopipe-delete-test-"));
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// Mock ~/env，讓 UPLOAD_DIR 指向暫時目錄
vi.mock("~/env", () => ({
  env: {
    get UPLOAD_DIR() {
      return tmpDir;
    },
  },
}));

// 動態 import route，確保 mock 已先載入
const getHandler = async () => {
  const mod = await import("./route");
  return mod.POST;
};

const makeRequest = (body: Record<string, unknown>) =>
  new NextRequest("http://localhost/api/delete", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });

interface DeleteResponse {
  success: boolean;
  message: string;
}

describe("DELETE /api/delete", () => {
  it("當 filename 未提供時，回傳 Filename is required", async () => {
    const POST = await getHandler();
    const req = makeRequest({});
    const res = await POST(req);
    const json = (await res.json()) as DeleteResponse;

    expect(json.success).toBe(false);
    expect(json.message).toBe("Filename is required");
  });

  it("當檔案不存在時，回傳 File not found", async () => {
    const POST = await getHandler();
    const req = makeRequest({ filename: "nonexistent.txt" });
    const res = await POST(req);
    const json = (await res.json()) as DeleteResponse;

    expect(json.success).toBe(false);
    expect(json.message).toBe("File not found");
  });

  it("成功刪除已存在的檔案", async () => {
    const POST = await getHandler();

    const filename = "to-delete.txt";
    const filePath = path.join(tmpDir, filename);
    fs.writeFileSync(filePath, "test content");
    expect(fs.existsSync(filePath)).toBe(true);

    const req = makeRequest({ filename });
    const res = await POST(req);
    const json = (await res.json()) as DeleteResponse;

    expect(json.success).toBe(true);
    expect(json.message).toBe("File deleted successfully");
    expect(fs.existsSync(filePath)).toBe(false);
  });

  it("當 filename 為空字串時，回傳 Filename is required", async () => {
    const POST = await getHandler();
    const req = makeRequest({ filename: "" });
    const res = await POST(req);
    const json = (await res.json()) as DeleteResponse;

    expect(json.success).toBe(false);
    expect(json.message).toBe("Filename is required");
  });
});
