import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  videoUrl: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const HexagonalBarcodeGenerator: React.FC<Props> = ({ videoUrl, canvasRef }) => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!videoUrl || !canvasRef.current) return;

    const video = document.createElement('video');
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d', { alpha: false, willReadFrequently: true });

    if (!ctx || !tempCtx) {
      setError('Canvas context not supported');
      return;
    }

    let cancelled = false;

    const drawHexagon = (x: number, y: number, size: number, color: string) => {
      const numberOfSides = 6;
      const step = 2 * Math.PI / numberOfSides;
      const shift = (Math.PI / 180.0) * 30;

      ctx.beginPath();
      for (let i = 0; i <= numberOfSides; i++) {
        const curStep = i * step + shift;
        const curX = x + size * Math.cos(curStep);
        const curY = y + size * Math.sin(curStep);
        if (i === 0) {
          ctx.moveTo(curX, curY);
        } else {
          ctx.lineTo(curX, curY);
        }
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    const generateBarcode = async () => {
      try {
        setProgress(0);
        setError('');

        video.src = videoUrl;
        await new Promise((resolve, reject) => {
          video.onloadedmetadata = resolve;
          video.onerror = reject;
        });

        const size = 1200; // Increased size for better quality
        canvas.width = size;
        canvas.height = size;
        tempCanvas.width = 64; // Increased sample size
        tempCanvas.height = 64;

        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, size, size);

        const frameCount = 91;
        const hexRadius = size / 24; // Adjusted for better proportion
        const centerX = size / 2;
        const centerY = size / 2;
        const duration = video.duration;
        const interval = duration / frameCount;

        const positions: [number, number][] = [];
        let currentRing = 1;
        let angle = 0;
        positions.push([centerX, centerY]);

        while (positions.length < frameCount) {
          const ringHexCount = currentRing * 6;
          const radiusMultiplier = hexRadius * 1.8;
          
          for (let i = 0; i < ringHexCount && positions.length < frameCount; i++) {
            const ringRadius = currentRing * radiusMultiplier;
            const x = centerX + ringRadius * Math.cos(angle);
            const y = centerY + ringRadius * Math.sin(angle);
            positions.push([x, y]);
            angle += (Math.PI * 2) / ringHexCount;
          }
          currentRing++;
        }

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';

        for (let i = 0; i < frameCount; i++) {
          if (cancelled) return;

          video.currentTime = i * interval;
          await new Promise(resolve => {
            video.onseeked = resolve;
          });

          tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
          const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const color = getAverageColor(imageData);

          const [x, y] = positions[i];
          drawHexagon(x, y, hexRadius, color);

          setProgress((i + 1) / frameCount * 100);
        }

        // Add subtle shadow effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

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
      <div className="aspect-square w-full bg-gray-700/30 rounded-xl overflow-hidden flex items-center justify-center">
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
        className="w-full aspect-square rounded-xl shadow-2xl"
        style={{
          imageRendering: 'crisp-edges',
        }}
      />
      {progress < 100 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 rounded-xl">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p className="text-lg font-semibold">
            Generating MINY pattern... {Math.round(progress)}%
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