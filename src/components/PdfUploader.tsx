import { useState } from "react";
import { uploadPdfToFolder } from "../services/uploadService";
import { Loader2, Upload } from "lucide-react";

interface PdfUploaderProps {
  folderId: string;
  onUploadSuccess?: (result: {
    downloadUrl: string;
    documentId: string;
  }) => void;
  onUploadError?: (error: Error) => void;
}

export const PdfUploader = ({
  folderId,
  onUploadSuccess,
  onUploadError,
}: PdfUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes("pdf")) {
      onUploadError?.(new Error("Please select a PDF file"));
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      onUploadError?.(new Error("File size must be less than 50MB"));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const result = await uploadPdfToFolder(folderId, file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      onUploadSuccess?.(result);
    } catch (error) {
      onUploadError?.(error as Error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="pdf-uploader">
      <label className="flex items-center justify-center w-full">
        <div className="flex flex-col items-center space-y-2">
          <div className={`p-4 border-2 border-dashed rounded-lg transition-colors ${
            isUploading ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}>
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                <span className="text-sm text-blue-500">Uploading... {uploadProgress}%</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-500">Click to upload PDF</span>
              </div>
            )}
          </div>
        </div>
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
      </label>
    </div>
  );
};