import { type NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";
import { env } from "~/env";

export const POST = async (req: NextRequest) => {
  const uploadDir = path.resolve(env.UPLOAD_DIR);
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ success: false });
  }

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.resolve(uploadDir, file.name);
  const writeStream = fs.createWriteStream(filePath);
  const reader = file.stream().getReader();

  await reader
    .read()
    .then(function process({
      done,
      value,
    }: ReadableStreamReadResult<Uint8Array>): Promise<void> | void {
      if (done) return;
      writeStream.write(value);
      return reader.read().then(process);
    });

  await new Promise<void>((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
    writeStream.end();
  });

  return NextResponse.json({ success: true, name: file.name });
};
