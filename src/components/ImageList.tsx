import { useState, useEffect, useRef } from 'react';
import { Settings, Download, X, Check, Loader2, Trash2 } from 'lucide-react';
import { ImageFile } from '../types';
import { QualityAdjuster } from './QualityAdjuster';
import { BatchQualityAdjuster } from './BatchQualityAdjuster';
import { formatFileSize } from '../utils/imageConverter';

interface ImageListProps {
  images: ImageFile[];
  onRemove: (id: string) => void;
  onRemoveAll: () => void;
  onQualityChange: (id: string, quality: number) => void;
  onBatchQualityChange: (quality: number) => void;
  onDownload: (id: string) => void;
  onDownloadAll: () => void;
  isDownloading: boolean;
}

export function ImageList({ 
  images, 
  onRemove, 
  onRemoveAll,
  onQualityChange, 
  onBatchQualityChange,
  onDownload, 
  onDownloadAll,
  isDownloading
}: ImageListProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const qualityAdjusterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedImage && !images.find(img => img.id === selectedImage)) {
      setSelectedImage(null);
    }
  }, [images, selectedImage]);

  useEffect(() => {
    if (selectedImage && qualityAdjusterRef.current) {
      qualityAdjusterRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedImage]);

  return (
    <div className="space-y-8">
      {images.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl shadow-lg">
              <span className="text-white font-bold text-lg">{images.length}</span>
              <span className="text-white/80 text-xs ml-1">images</span>
            </div>
            <button
              onClick={onRemoveAll}
              className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Trash2 className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              <span className="font-medium">Clear All</span>
            </button>
          </div>
          <button
            onClick={onDownloadAll}
            disabled={isDownloading}
            className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-medium">Creating ZIP...</span>
              </>
            ) : (
              <>
                <Download className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
                <span className="font-medium">Download All</span>
              </>
            )}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {images.map((image) => (
          <div key={image.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600 transform hover:-translate-y-1">
            <div className="relative aspect-square overflow-hidden">
              <img
                src={image.preview}
                alt={image.file.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Status indicator */}
              <div className="absolute top-3 left-3">
                {image.status === 'converting' && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/90 backdrop-blur-md rounded-full">
                    <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                    <span className="text-xs font-medium text-white">Converting...</span>
                  </div>
                )}
                {image.status === 'done' && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/90 backdrop-blur-md rounded-full">
                    <Check className="h-3.5 w-3.5 text-white" />
                    <span className="text-xs font-medium text-white">Done</span>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={() => onRemove(image.id)}
              className="absolute top-3 right-3 p-2 bg-red-500/90 backdrop-blur-md rounded-xl text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:scale-110 transform"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium dark:text-white truncate max-w-[140px]" title={image.file.name}>
                    {image.file.name}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                <span className="px-2 py-1 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 font-medium">
                  {image.file.type.split('/')[1].toUpperCase()}
                </span>
                <span className="text-gray-500 dark:text-gray-400">{formatFileSize(image.file.size)}</span>
                {image.webpBlob && (
                  <>
                    <span className="text-teal-500">→</span>
                    <span className="px-2 py-1 rounded-lg bg-gradient-to-r from-teal-500 to-blue-500 text-white font-medium">
                      {formatFileSize(image.webpBlob.size)}
                    </span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedImage(selectedImage === image.id ? null : image.id)}
                  disabled={image.status !== 'done'}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                >
                  <Settings className="h-4 w-4" />
                  <span>Quality</span>
                </button>
                
                {image.status === 'done' && (
                  <button
                    onClick={() => onDownload(image.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                  >
                    <Download className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div ref={qualityAdjusterRef} className="mt-8 transition-all duration-300">
          <QualityAdjuster
            image={images.find(img => img.id === selectedImage)!}
            onQualityChange={(quality) => onQualityChange(selectedImage, quality)}
            onDownload={() => onDownload(selectedImage)}
          />
        </div>
      )}

      {images.length > 0 && (
        <BatchQualityAdjuster
          images={images}
          onQualityChange={onBatchQualityChange}
          onDownloadAll={onDownloadAll}
        />
      )}
    </div>
  );
}