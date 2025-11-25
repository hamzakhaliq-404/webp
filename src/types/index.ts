export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  webpBlob?: Blob;
  quality: number;
  status: 'pending' | 'converting' | 'done' | 'error';
  error?: string;
}

export interface ConversionSettings {
  quality: number;
  scale: number;
}