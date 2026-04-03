import { type NextRequest, NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";
import { env } from "~/env";

export const POST = async (req: NextRequest) => {
  const uploadDir = path.resolve(env.UPLOAD_DIR);
  const { filename } = (await req.json()) as { filename: string };

  if (!filename) {
    return NextResponse.json({
      success: false,
      message: "Filename is required",
    });
  }

  const filePath = path.resolve(uploadDir, filename);

  try {
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({
        success: false,
        message: "File not found",
      });
    }

    fs.unlinkSync(filePath);

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Failed to delete file: ${String(error)}`,
    });
  }
};
