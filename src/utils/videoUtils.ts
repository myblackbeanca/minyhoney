export const getVideoMetadata = (videoUrl: string): Promise<{ duration: number }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.onloadedmetadata = () => {
      resolve({ duration: video.duration });
    };
    video.onerror = () => {
      reject(new Error('Failed to load video metadata'));
    };
  });
};