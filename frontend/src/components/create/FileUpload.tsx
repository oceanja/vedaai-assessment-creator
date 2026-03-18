"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, FileText } from "lucide-react";
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
      <div className="border border-dashed border-gray-200 rounded-xl p-5 flex items-center gap-3 bg-gray-50">
        <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center shrink-0">
          <FileText size={20} className="text-brand-orange" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
          <p className="text-xs text-gray-400">
            {(file.size / 1024).toFixed(0)} KB
          </p>
        </div>
        <button
          onClick={() => onChange(null)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          type="button"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={clsx(
        "border border-dashed rounded-xl p-8 flex flex-col items-center cursor-pointer transition-all",
        isDragActive
          ? "border-brand-orange bg-orange-50"
          : "border-gray-200 hover:border-brand-orange hover:bg-gray-50"
      )}
    >
      <input {...getInputProps()} />
      <UploadCloud
        size={36}
        className={clsx(
          "mb-3 transition-colors",
          isDragActive ? "text-brand-orange" : "text-gray-400"
        )}
        strokeWidth={1.5}
      />
      <p className="text-sm text-gray-600 font-medium">
        Choose a file or drag & drop it here
      </p>
      <p className="text-xs text-gray-400 mt-1">JPEG, PNG, PDF, upto 10MB</p>

      <button
        type="button"
        className="mt-4 text-sm border border-gray-200 text-gray-600 px-4 py-1.5 rounded-lg hover:bg-white transition-colors"
      >
        Browse Files
      </button>
    </div>
  );
}
