import { useState, useCallback, useEffect } from 'react';
import { Download, Moon, Sun } from 'lucide-react';
import JSZip from 'jszip';
import { DropZone } from './components/DropZone';
import { ImageList } from './components/ImageList';
import { convertToWebP } from './utils/imageConverter';
import { ImageFile } from './types';

function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from localStorage or system preference
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return saved === 'true';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isDownloading, setIsDownloading] = useState(false);

  // Save dark mode preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('darkMode', String(darkMode));
    // Update document class for consistent theme
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleFilesAdded = useCallback(async (files: File[]) => {
    const newImages: ImageFile[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      quality: 0.8,
      status: 'pending'
    }));

    setImages((prev) => [...prev, ...newImages]);

    for (const image of newImages) {
      try {
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id ? { ...img, status: 'converting' } : img
          )
        );

        const webpBlob = await convertToWebP(image.file, image.quality);

        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? { ...img, webpBlob, status: 'done' }
              : img
          )
        );
      } catch (error) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? { ...img, status: 'error', error: (error as Error).message }
              : img
          )
        );
      }
    }
  }, []);

  const handleRemove = useCallback((id: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
        if (imageToRemove.webpBlob) {
          URL.revokeObjectURL(URL.createObjectURL(imageToRemove.webpBlob));
        }
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const handleRemoveAll = useCallback(() => {
    images.forEach(image => {
      URL.revokeObjectURL(image.preview);
      if (image.webpBlob) {
        URL.revokeObjectURL(URL.createObjectURL(image.webpBlob));
      }
    });
    setImages([]);
  }, [images]);

  const handleQualityChange = useCallback(async (id: string, quality: number) => {
    const image = images.find((img) => img.id === id);
    if (!image) return;

    try {
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, status: 'converting' } : img
        )
      );

      const webpBlob = await convertToWebP(image.file, quality);

      setImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? { ...img, quality, webpBlob, status: 'done' }
            : img
        )
      );
    } catch (error) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === id
            ? { ...img, status: 'error', error: (error as Error).message }
            : img
        )
      );
    }
  }, [images]);

  const handleBatchQualityChange = useCallback(async (quality: number) => {
    for (const image of images) {
      await handleQualityChange(image.id, quality);
    }
  }, [images, handleQualityChange]);

  const handleDownload = useCallback((id: string) => {
    const image = images.find((img) => img.id === id);
    if (!image?.webpBlob) return;

    const url = URL.createObjectURL(image.webpBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${image.file.name.split('.')[0]}.webp`;
    link.click();
    URL.revokeObjectURL(url);
  }, [images]);

  const handleDownloadAll = useCallback(async () => {
    setIsDownloading(true);
    const zip = new JSZip();
    const convertedImages = images.filter((img) => img.webpBlob);

    if (convertedImages.length === 0) {
      console.warn('No converted images to download');
      setIsDownloading(false);
      return;
    }

    // Track file names to handle duplicates
    const fileNameCounts = new Map<string, number>();

    convertedImages.forEach((image) => {
      const baseName = image.file.name.split('.')[0];
      let fileName = `${baseName}.webp`;
      
      // Handle duplicate file names
      if (fileNameCounts.has(baseName)) {
        const count = fileNameCounts.get(baseName)! + 1;
        fileNameCounts.set(baseName, count);
        fileName = `${baseName}_${count}.webp`;
      } else {
        fileNameCounts.set(baseName, 1);
      }
      
      // Add the blob to the zip with unique name
      zip.file(fileName, image.webpBlob!, {
        binary: true,
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6
        }
      });
    });

    try {
      // Generate ZIP with optimized settings for large batches
      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6
        },
        streamFiles: true // Important for handling large batches
      });
      
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `converted-images-${Date.now()}.zip`;
      document.body.appendChild(link); // Ensure link is in DOM for some browsers
      link.click();
      document.body.removeChild(link);
      
      // Clean up after a delay to ensure download starts
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setIsDownloading(false);
      }, 100);
    } catch (error) {
      console.error('Error creating ZIP file:', error);
      alert('Failed to create ZIP file. Please try downloading images individually.');
      setIsDownloading(false);
    }
  }, [images]);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 transition-all duration-500">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-r from-teal-500 to-blue-500 p-3 rounded-2xl shadow-lg">
                  <Download className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-400 dark:to-blue-400 bg-clip-text text-transparent">
                  WebP Converter
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Convert images to WebP format with ease</p>
              </div>
            </div>
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="group relative p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 dark:from-blue-500 dark:to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity"></div>
              {darkMode ? (
                <Sun className="h-6 w-6 text-amber-500 transform group-hover:rotate-180 transition-transform duration-500" />
              ) : (
                <Moon className="h-6 w-6 text-blue-600 transform group-hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>
          </div>

          <DropZone onFilesAdded={handleFilesAdded} />

          {images.length > 0 && (
            <div className="mt-8 animate-fadeIn">
              <ImageList
                images={images}
                onRemove={handleRemove}
                onRemoveAll={handleRemoveAll}
                onQualityChange={handleQualityChange}
                onBatchQualityChange={handleBatchQualityChange}
                onDownload={handleDownload}
                onDownloadAll={handleDownloadAll}
                isDownloading={isDownloading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;