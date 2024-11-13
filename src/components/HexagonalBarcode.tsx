import React, { useEffect, useRef, useState } from 'react';

interface Props {
  videoUrl: string;
  onError: (error: string) => void;
}

export const HexagonalBarcode: React.FC<Props> = ({ videoUrl, onError }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!videoUrl || !canvasRef.current) return;

    const video = document.createElement('video');
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      onError('Canvas context not available');
      return;
    }

    const hexRadius = 20;
    const hexHeight = hexRadius * Math.sqrt(3);
    const columns = Math.floor(canvas.width / (hexRadius * 1.5));
    const rows = Math.floor(canvas.height / (hexHeight * 2)) * 2;

    const drawHexagon = (x: number, y: number, color: string) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const xPos = x + hexRadius * Math.cos(angle);
        const yPos = y + hexRadius * Math.sin(angle);
        if (i === 0) ctx.moveTo(xPos, yPos);
        else ctx.lineTo(xPos, yPos);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    const processFrame = (time: number) => {
      if (video.duration === 0) return '#000000';
      
      video.currentTime = time;
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) return '#000000';
      
      tempCanvas.width = 50;
      tempCanvas.height = 50;
      tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
      
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      let r = 0, g = 0, b = 0;
      
      for (let i = 0; i < imageData.data.length; i += 4) {
        r += imageData.data[i];
        g += imageData.data[i + 1];
        b += imageData.data[i + 2];
      }
      
      const pixelCount = imageData.data.length / 4;
      return `rgb(${Math.round(r/pixelCount)}, ${Math.round(g/pixelCount)}, ${Math.round(b/pixelCount)})`;
    };

    const generateHexagonalPattern = async () => {
      setProcessing(true);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const totalHexagons = rows * columns;
      let processedHexagons = 0;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const x = col * hexRadius * 1.5;
          const y = row * hexHeight + (col % 2) * hexHeight / 2;
          
          const time = (processedHexagons / totalHexagons) * video.duration;
          const color = processFrame(time);
          
          drawHexagon(x, y, color);
          processedHexagons++;
          setProgress(Math.round((processedHexagons / totalHexagons) * 100));
        }
      }
      setProcessing(false);
    };

    const handleVideoLoad = () => {
      canvas.width = 800;
      canvas.height = 400;
      generateHexagonalPattern().catch(err => {
        onError('Error processing video: ' + err.message);
        setProcessing(false);
      });
    };

    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.addEventListener('loadedmetadata', handleVideoLoad);
    video.addEventListener('error', () => {
      onError('Error loading video. Please try a different file or URL.');
      setProcessing(false);
    });

    return () => {
      video.removeEventListener('loadedmetadata', handleVideoLoad);
    };
  }, [videoUrl, onError]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-lg"
      />
      {processing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <div className="text-center">
            <div className="mb-2">Processing: {progress}%</div>
            <div className="w-48 h-2 bg-gray-700 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};