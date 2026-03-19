"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { clsx } from "clsx";

interface FileUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

export default function FileUpload({ file, onChange }: FileUploadProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onChange(accepted[0]);
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  if (file) {
    return (
      <div className="border-[1.5px] border-solid border-[#8b5cf6] rounded-[10px] p-[28px_20px] flex flex-col items-center justify-center gap-[8px] mb-[10px] bg-[#f3f3f3]">
        <div className="text-[13.5px] text-[#444] font-[600] truncate max-w-full px-4">{file.name}</div>
        <div className="text-[11.5px] text-[#888]">{(file.size / 1024).toFixed(0)} KB</div>
        <button
          onClick={(e) => { e.stopPropagation(); onChange(null); }}
          className="bg-white border border-[#ddd] rounded-[7px] px-[18px] py-[7px] text-[12.5px] font-[500] text-[#ef4444] cursor-pointer mt-[4px] hover:bg-[#ffe6e6] transition-colors"
          type="button"
        >
          Remove File
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        {...getRootProps()}
        className={clsx(
          "border-[1.5px] border-dashed rounded-[10px] p-[28px_20px] flex flex-col items-center justify-center gap-[8px] cursor-pointer mb-[10px] transition-colors",
          isDragActive ? "border-[#8b5cf6] bg-[#f3f3f3]" : "border-[#ccc] bg-[#fafafa] hover:border-[#8b5cf6]"
        )}
      >
        <input {...getInputProps()} />
        <div className="text-[#555]">
          <svg viewBox="0 0 24 24" className="w-[32px] h-[32px] stroke-current fill-none stroke-[1.5]"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
        </div>
        <div className="text-[13.5px] text-[#444] font-[500]">Choose a file or drag & drop it here</div>
        <div className="text-[11.5px] text-[#aaa]">JPEG, PNG, upto 10MB</div>
        <button
          type="button"
          className="bg-white border border-[#ddd] rounded-[7px] px-[18px] py-[7px] text-[12.5px] font-[500] text-[#333] cursor-pointer mt-[4px] hover:bg-[#f5f5f5] transition-colors"
        >
          Browse Files
        </button>
      </div>
      <div className="text-[12px] text-[#888] text-center mb-[18px]">Upload images of your preferred document/image</div>
    </>
  );
}
