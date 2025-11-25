import { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FolderOpen, FileArchive, Loader2 } from 'lucide-react';
import JSZip from 'jszip';

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
}

export function DropZone({ onFilesAdded }: DropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

  const extractImagesFromZip = async (zipFile: File): Promise<File[]> => {
    setProcessingMessage(`Extracting images from ${zipFile.name}...`);
    try {
      const zip = new JSZip();
      const content = await zip.loadAsync(zipFile);
      const imageFiles: File[] = [];

      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.bmp', '.avif', '.webp'];

      for (const [filename, file] of Object.entries(content.files)) {
        if (!file.dir && imageExtensions.some(ext => filename.toLowerCase().endsWith(ext))) {
          const blob = await file.async('blob');
          const mimeType = filename.toLowerCase().endsWith('.png') ? 'image/png' :
                          filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg') ? 'image/jpeg' :
                          filename.toLowerCase().endsWith('.gif') ? 'image/gif' :
                          filename.toLowerCase().endsWith('.svg') ? 'image/svg+xml' :
                          filename.toLowerCase().endsWith('.bmp') ? 'image/bmp' :
                          filename.toLowerCase().endsWith('.avif') ? 'image/avif' :
                          filename.toLowerCase().endsWith('.webp') ? 'image/webp' :
                          'image/jpeg';
          
          const imageFile = new File([blob], filename, { type: mimeType });
          imageFiles.push(imageFile);
        }
      }

      return imageFiles;
    } catch (error) {
      console.error('Error extracting images from ZIP:', error);
      return [];
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    const allFiles: File[] = [];

    try {
      for (const file of acceptedFiles) {
        // Check if it's a ZIP file
        if (file.type === 'application/zip' || file.type === 'application/x-zip-compressed' || file.name.toLowerCase().endsWith('.zip')) {
          const extractedImages = await extractImagesFromZip(file);
          allFiles.push(...extractedImages);
        } else {
          allFiles.push(file);
        }
      }

      if (allFiles.length > 0) {
        setProcessingMessage(`Processing ${allFiles.length} images...`);
        onFilesAdded(allFiles);
      }
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingMessage('');
      }, 500);
    }
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico', '.bmp', '.avif'],
      'application/zip': ['.zip']
    },
    noClick: true // Disable click to allow custom buttons
  });

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFolderClick = () => {
    folderInputRef.current?.click();
  };

  const handleFolderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setIsProcessing(true);
      setProcessingMessage(`Loading ${files.length} files from folder...`);
      setTimeout(() => {
        onFilesAdded(files);
        setIsProcessing(false);
        setProcessingMessage('');
      }, 300);
    }
  };

  return (
    <div
      {...getRootProps()}
      className={`group relative p-12 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-300 overflow-hidden
        ${isDragActive 
          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30 scale-[1.02] shadow-xl' 
          : 'border-gray-300 dark:border-gray-700 hover:border-teal-500 dark:hover:border-teal-400 bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-lg hover:shadow-xl'}`}
    >
      <input {...getInputProps()} ref={fileInputRef} />
      <input 
        type="file" 
        ref={folderInputRef}
        onChange={handleFolderChange}
        {...({webkitdirectory: '', directory: '', mozdirectory: ''} as any)}
        style={{ display: 'none' }}
        multiple
      />
      
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-2xl">
          <Loader2 className="h-12 w-12 text-teal-500 animate-spin mb-4" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-200">{processingMessage}</p>
        </div>
      )}
      
      <div className="relative">
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="relative inline-block">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            
            <div className={`relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900/40 dark:to-blue-900/40 flex items-center justify-center transition-transform duration-300 ${
              isDragActive ? 'scale-110 rotate-6' : 'group-hover:scale-105'
            }`}>
              <Upload className={`h-10 w-10 transition-all duration-300 ${
                isDragActive 
                  ? 'text-teal-600 dark:text-teal-400 animate-bounce' 
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400'
              }`} />
            </div>
          </div>

          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            
            <div className={`relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 flex items-center justify-center transition-transform duration-300 ${
              isDragActive ? 'scale-110 -rotate-6' : 'group-hover:scale-105'
            }`}>
              <FolderOpen className={`h-10 w-10 transition-all duration-300 ${
                isDragActive 
                  ? 'text-purple-600 dark:text-purple-400 animate-bounce' 
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400'
              }`} />
            </div>
          </div>

          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
            
            <div className={`relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40 flex items-center justify-center transition-transform duration-300 ${
              isDragActive ? 'scale-110 rotate-6' : 'group-hover:scale-105'
            }`}>
              <FileArchive className={`h-10 w-10 transition-all duration-300 ${
                isDragActive 
                  ? 'text-orange-600 dark:text-orange-400 animate-bounce' 
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400'
              }`} />
            </div>
          </div>
        </div>
        
        <p className="mt-2 text-lg font-medium text-gray-700 dark:text-gray-200">
          {isDragActive
            ? '✨ Drop your files here'
            : 'Drag & drop images, folders, or ZIP files'}
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          or click the buttons below to browse
        </p>
        
        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleFileClick}
            className="group/btn flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
          >
            <Upload className="h-4 w-4 group-hover/btn:-translate-y-0.5 transition-transform" />
            <span>Select Files</span>
          </button>
          
          <button
            type="button"
            onClick={handleFolderClick}
            className="group/btn flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
          >
            <FolderOpen className="h-4 w-4 group-hover/btn:scale-110 transition-transform" />
            <span>Select Folder</span>
          </button>
        </div>
        
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {['JPG', 'PNG', 'GIF', 'SVG', 'BMP', 'AVIF', 'ZIP'].map((format) => (
            <span key={format} className={`px-3 py-1 text-xs font-medium rounded-full ${
              format === 'ZIP' 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}>
              {format}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}