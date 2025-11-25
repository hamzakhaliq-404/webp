import { useState } from 'react';
import { Download, Settings } from 'lucide-react';
import { ImageFile } from '../types';
import { formatFileSize } from '../utils/imageConverter';

interface BatchQualityAdjusterProps {
  images: ImageFile[];
  onQualityChange: (quality: number) => void;
  onDownloadAll: () => void;
}

export function BatchQualityAdjuster({ images, onQualityChange, onDownloadAll }: BatchQualityAdjusterProps) {
  const [quality, setQuality] = useState(0.8);

  const totalOriginalSize = images.reduce((acc, img) => acc + img.file.size, 0);
  const totalWebPSize = images.reduce((acc, img) => acc + (img.webpBlob?.size || 0), 0);
  const compressionRatio = totalWebPSize ? Math.round((1 - totalWebPSize / totalOriginalSize) * 100) : 0;

  const handleQualityChange = (newQuality: number) => {
    setQuality(newQuality);
    onQualityChange(newQuality);
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-50/50 to-blue-50/50 dark:from-teal-950/20 dark:to-blue-950/20">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            Batch Quality Settings
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">Original: {formatFileSize(totalOriginalSize)}</span>
            </div>
            {totalWebPSize > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-teal-500 to-blue-500" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">WebP: {formatFileSize(totalWebPSize)}</span>
                <span className="px-2 py-0.5 bg-gradient-to-r from-green-500 to-teal-500 text-white text-xs font-bold rounded-full">
                  {compressionRatio}% smaller
                </span>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={onDownloadAll}
          className="group flex items-center gap-2 px-5 py-2.5 text-sm rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:from-teal-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
        >
          <Download className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
          <span>Download All</span>
        </button>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-4">
          <label htmlFor="batchQuality" className="text-sm font-bold text-gray-700 dark:text-gray-300 min-w-[70px]">
            Quality:
          </label>
          <div className="relative flex-1">
            <input
              id="batchQuality"
              type="range"
              min="1"
              max="100"
              value={quality * 100}
              onChange={(e) => handleQualityChange(Number(e.target.value) / 100)}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
              style={{
                background: `linear-gradient(to right, rgb(20, 184, 166) 0%, rgb(20, 184, 166) ${quality * 100}%, rgb(229, 231, 235) ${quality * 100}%, rgb(229, 231, 235) 100%)`
              }}
            />
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-1">
              <span className="text-xs text-gray-400 font-medium">Low</span>
              <span className="text-xs text-gray-400 font-medium">Medium</span>
              <span className="text-xs text-gray-400 font-medium">High</span>
            </div>
          </div>
          <div className="min-w-[80px] text-center">
            <div className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl shadow-lg">
              <span className="text-white font-bold text-lg">{Math.round(quality * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}