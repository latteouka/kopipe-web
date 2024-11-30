import { type NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import pdfParse from "pdf-parse";

export async function POST(request: NextRequest) {
  const formData = await request.formData(); // Parse multipart form data
  const file = formData.get("file"); // Retrieve the uploaded file

  // Process the file (e.g., save to disk or cloud storage)
  console.log("Received file:", file);

  // Save the file to a temporary location
  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, file.name);
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(tempFilePath, fileBuffer);

  // Read the text from the PDF file
  const pdfBuffer = await fs.readFile(tempFilePath); // Read the saved file
  const pdfData = await pdfParse(pdfBuffer);

  return NextResponse.json({ result: pdfData.text });
}
