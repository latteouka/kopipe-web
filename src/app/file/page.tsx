"use client";

import axios from "axios";
import React, { useState } from "react";

const fileTypes = ["PDF"];

const PDFReader = () => {
  const [result, setResult] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const handleChange = async (file: File) => {
    setFile(file);
    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file); // Append the file to the form data

      const response = await axios.post<{ result: string }>(
        "/file/api/pdf",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Set the correct content type
          },
        },
      );

      console.log("File uploaded successfully:", response.data);
      setResult(response.data.result);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="font-bold">上傳PDF檔案</div>
      {/* Fullscreen FileUploader */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="pointer-events-auto rounded-md border-4 border-dashed border-gray-400 p-4"></div>
      </div>
      <div className="mt-4 flex flex-col gap-3 rounded-md border border-gray-300 p-4">
        {result !== "" && (
          <>
            <div className="font-bold">PDF 內容</div>
            <div className="whitespace-pre-line break-all text-gray-700">
              {result}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default PDFReader;
