import { useState, useEffect } from 'react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { Download } from 'lucide-react';
import { ImageFile } from '../types';
import { formatFileSize } from '../utils/imageConverter';

interface QualityAdjusterProps {
  image: ImageFile;
  onQualityChange: (quality: number) => void;
  onDownload: () => void;
}

export function QualityAdjuster({ image, onQualityChange, onDownload }: QualityAdjusterProps) {
  const [quality, setQuality] = useState(image.quality);
  const [webpUrl, setWebpUrl] = useState<string>('');

  useEffect(() => {
    if (image.webpBlob) {
      setWebpUrl(URL.createObjectURL(image.webpBlob));
      return () => {
        URL.revokeObjectURL(webpUrl);
      };
    }
  }, [image.webpBlob]);

  const handleQualityChange = (newQuality: number) => {
    setQuality(newQuality);
    onQualityChange(newQuality);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="text-base font-medium text-gray-900 dark:text-white">
            Quality Comparison - {image.file.name}
          </h3>
          <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Original ({formatFileSize(image.file.size)})</span>
            </div>
            {image.webpBlob && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                <span>WebP ({formatFileSize(image.webpBlob.size)} • {Math.round((1 - image.webpBlob.size / image.file.size) * 100)}% smaller)</span>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition-colors duration-300"
        >
          <Download className="h-4 w-4" />
          <span>Download WebP</span>
        </button>
      </div>

      <div className="bg-gray-100 dark:bg-gray-900">
        <ReactCompareSlider
          itemOne={<ReactCompareSliderImage src={image.preview} alt="Original" />}
          itemTwo={<ReactCompareSliderImage src={webpUrl} alt="WebP" />}
          className="w-full aspect-[16/9]"
          position={50}
        />
      </div>

      <div className="p-3">
        <div className="flex items-center gap-3">
          <label htmlFor="quality" className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px]">
            Quality:
          </label>
          <div className="relative flex-1">
            <input
              id="quality"
              type="range"
              min="1"
              max="100"
              value={quality * 100}
              onChange={(e) => handleQualityChange(Number(e.target.value) / 100)}
              className="w-full"
            />
            <div className="absolute -bottom-3 left-0 right-0 flex justify-between px-1">
              <span className="text-[10px] text-gray-400">1%</span>
              <span className="text-[10px] text-gray-400">50%</span>
              <span className="text-[10px] text-gray-400">100%</span>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[3rem] text-center">
            {Math.round(quality * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}