import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  videoUrl: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const ColorBarcodeGenerator: React.FC<Props> = ({ videoUrl, canvasRef }) => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!videoUrl || !canvasRef.current) return;

    const video = document.createElement('video');
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    if (!ctx || !tempCtx) {
      setError('Canvas context not supported');
      return;
    }

    let cancelled = false;

    const generateBarcode = async () => {
      try {
        setProgress(0);
        setError('');

        // Set video properties
        video.src = videoUrl;
        await new Promise((resolve, reject) => {
          video.onloadedmetadata = resolve;
          video.onerror = reject;
        });

        // Set canvas dimensions
        const width = 1000;
        const height = 200;
        canvas.width = width;
        canvas.height = height;
        tempCanvas.width = 32;
        tempCanvas.height = 32;

        // Clear canvas
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, width, height);

        // Calculate frame intervals
        const duration = video.duration;
        const frameCount = 300;
        const interval = duration / frameCount;
        const barWidth = width / frameCount;

        // Process frames
        for (let i = 0; i < frameCount; i++) {
          if (cancelled) return;

          // Set video time and wait for frame
          video.currentTime = i * interval;
          await new Promise(resolve => {
            video.onseeked = resolve;
          });

          // Get average color
          tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
          const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const color = getAverageColor(imageData);

          // Draw color bar
          ctx.fillStyle = color;
          ctx.fillRect(i * barWidth, 0, barWidth, height);

          // Update progress
          setProgress((i + 1) / frameCount * 100);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error processing video');
      }
    };

    generateBarcode();

    return () => {
      cancelled = true;
      video.src = '';
    };
  }, [videoUrl]);

  if (error) {
    return (
      <div className="aspect-[5/1] w-full bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-400 mb-2">⚠️ {error}</p>
          <p className="text-sm text-gray-400">Try uploading a different video file</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full aspect-[5/1] rounded-lg"
      />
      {progress < 100 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p className="text-lg font-semibold">
            Generating barcode... {Math.round(progress)}%
          </p>
        </div>
      )}
    </div>
  );
};

function getAverageColor(imageData: ImageData): string {
  let r = 0, g = 0, b = 0;
  const data = imageData.data;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  r = Math.round(r / pixelCount);
  g = Math.round(g / pixelCount);
  b = Math.round(b / pixelCount);

  return `rgb(${r}, ${g}, ${b})`;
}