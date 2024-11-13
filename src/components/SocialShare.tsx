import React from 'react';
import { Share2 } from 'lucide-react';

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const SocialShare: React.FC<Props> = ({ canvasRef }) => {
  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Create a new canvas with watermark
      const watermarkCanvas = document.createElement('canvas');
      const ctx = watermarkCanvas.getContext('2d');
      if (!ctx) return;

      // Set dimensions
      watermarkCanvas.width = canvas.width;
      watermarkCanvas.height = canvas.height;

      // Draw the original image
      ctx.drawImage(canvas, 0, 0);

      // Add watermark with shadow for better visibility
      ctx.save();
      ctx.font = 'bold 32px Inter, system-ui, sans-serif';
      
      // Add shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // Draw text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.textAlign = 'end';
      ctx.textBaseline = 'bottom';
      ctx.fillText('minyvinyl.com', canvas.width - 30, canvas.height - 30);
      ctx.restore();

      // Share implementation
      try {
        // Try Web Share API first
        if (navigator.share) {
          const blob = await new Promise<Blob>((resolve) => 
            watermarkCanvas.toBlob((blob) => resolve(blob!), 'image/png', 1.0)
          );
          
          await navigator.share({
            title: 'My MINY Album Art',
            text: 'Check out this unique album art I created with MINY!',
            files: [new File([blob], 'miny-album-art.png', { type: 'image/png' })]
          });
        } else {
          // Fallback to download
          const dataUrl = watermarkCanvas.toDataURL('image/png', 1.0);
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = 'miny-album-art.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } catch (shareError) {
        // If Web Share API fails, fallback to download
        const dataUrl = watermarkCanvas.toDataURL('image/png', 1.0);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'miny-album-art.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
      aria-label="Share pattern"
    >
      <Share2 className="w-5 h-5" />
      Share
    </button>
  );
};