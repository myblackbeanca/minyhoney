import { AbsoluteFill } from 'remotion';
import { useEffect, useState, useRef } from 'react';
import { useVideoProcessor } from './VideoProcessor';
import { Loader2 } from 'lucide-react';

interface Props {
  videoUrl: string;
}

export const ColorBarcode: React.FC<Props> = ({ videoUrl }) => {
  const [colors, setColors] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const processedUrlRef = useRef<string>('');
  const mounted = useRef(true);

  const handleProgress = (newColors: string[], progressPercent: number, estimatedSeconds: number | null) => {
    if (mounted.current) {
      setColors(newColors);
      setProgress(progressPercent);
      setTimeRemaining(estimatedSeconds);
    }
  };

  const { processVideo } = useVideoProcessor({
    videoUrl,
    onProgress: handleProgress,
    onError: (err) => {
      if (mounted.current) {
        setError(err);
      }
    },
    onProcessingChange: (processing) => {
      if (mounted.current) {
        setIsProcessing(processing);
      }
    },
  });

  useEffect(() => {
    mounted.current = true;

    if (videoUrl && videoUrl !== processedUrlRef.current) {
      setColors([]);
      setProgress(0);
      setTimeRemaining(null);
      setError('');
      processedUrlRef.current = videoUrl;
      processVideo().catch((err) => {
        if (mounted.current) {
          setError(err.message);
        }
      });
    }

    return () => {
      mounted.current = false;
    };
  }, [videoUrl, processVideo]);

  if (error) {
    return (
      <AbsoluteFill style={{ backgroundColor: '#1a1a1a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center p-4">
          <p className="text-red-400 mb-2">⚠️ {error}</p>
          <p className="text-sm text-gray-400">Try uploading a different video file or check if the file is corrupted.</p>
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a1a1a' }}>
      {(isProcessing || progress < 100) && colors.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4 bg-black bg-opacity-75 z-10">
          <Loader2 className="w-8 h-8 animate-spin" />
          <div className="text-center">
            <p className="mb-2 text-lg font-semibold">
              Processing video... {Math.round(progress)}%
            </p>
            {timeRemaining !== null && (
              <p className="text-sm text-gray-400">
                Estimated time remaining: {timeRemaining > 60 
                  ? `${Math.round(timeRemaining / 60)} minutes` 
                  : `${Math.round(timeRemaining)} seconds`}
              </p>
            )}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        {colors.map((color, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              backgroundColor: color,
              height: '100%',
              transition: 'background-color 0.2s ease',
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};