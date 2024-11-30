import { type NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { env } from "~/env";

const UPLOAD_DIR = path.resolve(env.UPLOAD_DIR);

export const POST = async (req: NextRequest) => {
  const { filename } = (await req.json()) as { filename: string };

  if (!filename) {
    return NextResponse.json({
      success: false,
      message: "Filename is required",
    });
  }

  const filePath = path.resolve(UPLOAD_DIR, filename);

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
      message: "An error occurred while deleting the file",
    });
  }
};
