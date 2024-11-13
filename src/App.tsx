import { useState, useCallback, useRef } from 'react';
import { FileVideo, Upload, Download, Hexagon, LayoutList, Share2, ExternalLink, Music, Twitter, Instagram, Youtube } from 'lucide-react';
import { HexagonalBarcodeGenerator } from './components/HexagonalBarcodeGenerator';
import { LinearBarcodeGenerator } from './components/LinearBarcodeGenerator';
import { MixtapeCards } from './components/MixtapeCards';
import { SocialShare } from './components/SocialShare';

const MINY_URL = 'https://minyfy.subwaymusician.xyz/makeaminy';

function App() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  const [view, setView] = useState<'miny' | 'linear'>('miny');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (!file.type.startsWith('video/')) {
          throw new Error('Please upload a valid video file');
        }
        
        if (file.size > 100 * 1024 * 1024) {
          throw new Error('Video file size must be less than 100MB');
        }

        if (videoUrl) {
          URL.revokeObjectURL(videoUrl);
        }
        
        const url = URL.createObjectURL(file);
        setVideoFile(file);
        setVideoUrl(url);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while processing the video');
        setVideoFile(null);
        setVideoUrl('');
      }
    }
  }, [videoUrl]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              MINY Album Art
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 flex items-center justify-center gap-3">
              <FileVideo className="w-8 h-8" />
              Video Color Pattern Generator
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Transform your videos into unique abstract patterns perfect for album covers
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl mb-8 border border-gray-700/50">
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Video
                </h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Upload video file"
                />
                <button
                  onClick={handleUploadClick}
                  className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
                  aria-label="Select video file"
                >
                  <Upload className="w-5 h-5" />
                  Select Video File
                </button>
                {videoFile && (
                  <p className="mt-2 text-sm text-gray-400">
                    Selected: {videoFile.name}
                  </p>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl" role="alert">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setView('miny')}
                  className={`flex-1 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                    view === 'miny'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  aria-pressed={view === 'miny'}
                >
                  <Hexagon className="w-5 h-5" />
                  MINY Pattern
                </button>
                <button
                  onClick={() => setView('linear')}
                  className={`flex-1 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                    view === 'linear'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  aria-pressed={view === 'linear'}
                >
                  <LayoutList className="w-5 h-5" />
                  Linear Pattern
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-gray-700/50 mb-8">
            {view === 'miny' ? (
              <HexagonalBarcodeGenerator videoUrl={videoUrl} canvasRef={canvasRef} />
            ) : (
              <LinearBarcodeGenerator videoUrl={videoUrl} canvasRef={canvasRef} />
            )}
            
            {videoUrl && (
              <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => {
                    const canvas = canvasRef.current;
                    if (canvas) {
                      const link = document.createElement('a');
                      link.download = `MINY-pattern-${Date.now()}.png`;
                      link.href = canvas.toDataURL('image/png');
                      link.click();
                    }
                  }}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
                  aria-label="Download pattern"
                >
                  <Download className="w-5 h-5" />
                  Download Pattern
                </button>
                <SocialShare canvasRef={canvasRef} />
              </div>
            )}
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl border border-gray-700/50 mb-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
                <Music className="w-6 h-6" />
                Create Your MINY Mixtape
              </h3>
              <p className="text-gray-300 mb-6">
                Turn your music collection into a unique MINY vinyl experience
              </p>
              <a
                href={MINY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-lg font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                Create a MINY Mixtape
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
            <MixtapeCards />
          </div>

          <footer className="text-center text-gray-400">
            <p className="mb-4">
              Each pattern represents the color progression of your video,
              creating a unique visual fingerprint perfect for album covers or artwork.
            </p>
            <div className="flex items-center justify-center gap-6">
              <a
                href="https://twitter.com/minyvinyl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition-colors"
                aria-label="Follow MINY on Twitter"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href="https://instagram.com/minyvinyl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition-colors"
                aria-label="Follow MINY on Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://youtube.com/@minyvinyl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-purple-400 transition-colors"
                aria-label="Subscribe to MINY on YouTube"
              >
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;