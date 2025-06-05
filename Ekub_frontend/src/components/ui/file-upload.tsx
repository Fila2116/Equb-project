import type React from "react";
import { useRef, useState, useEffect } from "react";
import { Upload, X, Check } from "lucide-react";

interface FileUploadProps {
  label: string;
  value: File | null; // File or null
  onChange: (value: File | null) => void;
  accept?: string;
}

export function FileUpload({
  label,
  value,
  onChange,
  accept = "image/*",
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [justUploaded, setJustUploaded] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Update preview URL whenever value (File) changes
  useEffect(() => {
    if (value) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl); // cleanup on unmount or change
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleFileSelect = async (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setIsUploading(true);

      // Simulate upload delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 800));

      onChange(file); // pass the File itself, not string

      setIsUploading(false);
      setJustUploaded(true);
      setTimeout(() => setJustUploaded(false), 2000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-3 transition-colors duration-200">
        {label}
      </label>

      {value ? (
        <div className="relative group">
          <div
            className={`
            relative overflow-hidden rounded-xl border-2 transition-all duration-300
            ${
              justUploaded
                ? "border-green-400 shadow-lg shadow-green-100"
                : "border-slate-200 group-hover:border-slate-300 group-hover:shadow-md"
            }
          `}>
            <img
              src={preview || "/placeholder.svg"}
              alt="Preview"
              className="w-full h-24 object-contain bg-slate-50 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <button
                onClick={handleRemove}
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 hover:scale-110 transform">
                <X className="w-4 h-4" />
              </button>
            </div>
            {justUploaded && (
              <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full animate-bounce">
                <Check className="w-3 h-3" />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`
            relative cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 transform
            ${
              isDragging
                ? "border-blue-400 bg-blue-50 scale-105 shadow-lg"
                : "border-slate-300 hover:border-slate-400 hover:bg-slate-50 hover:scale-[1.02] hover:shadow-sm"
            }
            ${isUploading ? "pointer-events-none" : ""}
          `}>
          <div className="flex flex-col items-center space-y-3">
            <div
              className={`
              p-3 rounded-full transition-all duration-300
              ${
                isDragging
                  ? "bg-blue-200 scale-110"
                  : isUploading
                  ? "bg-blue-100 animate-pulse"
                  : "bg-slate-100 group-hover:bg-slate-200"
              }
            `}>
              <Upload
                className={`
                w-2 h-2 transition-all duration-300
                ${
                  isDragging
                    ? "text-blue-600 animate-bounce"
                    : isUploading
                    ? "text-blue-500 animate-spin"
                    : "text-slate-600"
                }
              `}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 transition-colors duration-200">
                {isUploading
                  ? "Uploading..."
                  : isDragging
                  ? "Drop it here!"
                  : "Upload an image"}
              </p>
              <p className="text-xs text-slate-600">PNG, JPG, SVG up to 10MB</p>
            </div>
          </div>

          {isUploading && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
              <div className="w-2 h-2 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />
    </div>
  );
}
