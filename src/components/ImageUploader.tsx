import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Check, 
  AlertCircle,
  Loader2
} from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  accept?: string;
  maxSize?: number; // MB
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  placeholder = "点击上传图片或拖拽图片到此处",
  accept = "image/*",
  maxSize = 5
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    setError('');
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }
    
    // 验证文件大小
    if (file.size > maxSize * 1024 * 1024) {
      setError(`文件大小不能超过 ${maxSize}MB`);
      return;
    }
    
    setIsUploading(true);
    
    try {
      // 这里可以集成真实的图片上传服务
      // 目前使用本地预览URL作为示例
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange(result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
      
      // 模拟上传延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (err) {
      setError('上传失败，请重试');
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const clearImage = () => {
    onChange('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* 拖拽上传区域 */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
          isDragging
            ? 'border-[#194fe8] bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div className="text-center">
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-8 h-8 text-[#194fe8] animate-spin mb-2" />
              <p className="text-sm text-gray-600">上传中...</p>
            </div>
          ) : value ? (
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <img
                  src={value}
                  alt="预览"
                  className="w-32 h-24 object-cover rounded-lg"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearImage();
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center text-green-600">
                <Check className="w-4 h-4 mr-1" />
                <span className="text-sm">图片已上传</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">点击重新上传</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-1">{placeholder}</p>
              <p className="text-xs text-gray-500">
                支持 JPG、PNG、GIF 格式，最大 {maxSize}MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* URL 输入框 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          或输入图片URL
        </label>
        <div className="relative">
          <input
            type="url"
            value={value}
            onChange={handleUrlChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent pr-10"
            placeholder="https://example.com/image.jpg"
          />
          <ImageIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;