import { useCallback, useRef } from 'react';
import { getVideoMetadata, getVideoFrame } from '@remotion/media-utils';

interface Props {
  videoUrl: string;
  onProgress: (colors: string[], progressPercent: number, estimatedSecondsRemaining: number | null) => void;
  onError: (error: string) => void;
  onProcessingChange: (processing: boolean) => void;
}

export const useVideoProcessor = ({
  videoUrl,
  onProgress,
  onError,
  onProcessingChange,
}: Props) => {
  const processingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getAverageColor = (imageData: ImageData) => {
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      r += imageData.data[i];
      g += imageData.data[i + 1];
      b += imageData.data[i + 2];
    }
    const pixelCount = imageData.data.length / 4;
    return `rgb(${Math.round(r/pixelCount)}, ${Math.round(g/pixelCount)}, ${Math.round(b/pixelCount)})`;
  };

  const processVideo = useCallback(async () => {
    if (!videoUrl || processingRef.current) {
      return;
    }

    // Cancel any existing processing
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      processingRef.current = true;
      onProcessingChange(true);
      
      const metadata = await getVideoMetadata(videoUrl);
      const frameCount = Math.min(300, metadata.durationInFrames);
      const frameColors: string[] = [];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not create canvas context');
      }

      const startTime = Date.now();
      const batchSize = 5; // Process frames in smaller batches

      for (let i = 0; i < frameCount; i += batchSize) {
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Processing cancelled');
        }

        const currentBatch = Math.min(batchSize, frameCount - i);
        const batchPromises = Array.from({ length: currentBatch }, async (_, index) => {
          const frameIndex = i + index;
          const frame = await getVideoFrame({
            src: videoUrl,
            frame: Math.floor((frameIndex / frameCount) * metadata.durationInFrames),
            width: 32,
            height: 32,
          });

          canvas.width = frame.width;
          canvas.height = frame.height;
          ctx.drawImage(frame, 0, 0);
          
          const imageData = ctx.getImageData(0, 0, frame.width, frame.height);
          return getAverageColor(imageData);
        });

        const batchColors = await Promise.all(batchPromises);
        frameColors.push(...batchColors);

        const progress = ((i + currentBatch) / frameCount) * 100;
        const elapsedTime = (Date.now() - startTime) / 1000;
        const framesPerSecond = (i + currentBatch) / elapsedTime;
        const remaining = frameCount - (i + currentBatch);
        const estimatedSeconds = framesPerSecond > 0 ? remaining / framesPerSecond : null;
        
        onProgress(frameColors, progress, estimatedSeconds);
      }

      onProgress(frameColors, 100, 0);
    } catch (error) {
      if (error instanceof Error && error.message === 'Processing cancelled') {
        return;
      }
      console.error('Error processing video:', error);
      onError('Failed to process video. Please try uploading a different video file.');
    } finally {
      processingRef.current = false;
      onProcessingChange(false);
      abortControllerRef.current = null;
    }
  }, [videoUrl, onProgress, onError, onProcessingChange]);

  return { processVideo };
};