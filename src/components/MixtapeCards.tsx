import React from 'react';
import { Music2, Youtube, Apple, Disc, Radio, Hash, User2 } from 'lucide-react';

const platforms = [
  { 
    name: 'Spotify', 
    icon: Music2, 
    color: 'bg-green-500',
    url: 'https://spotify.minyvinyl.com'
  },
  { 
    name: 'YouTube', 
    icon: Youtube, 
    color: 'bg-red-500',
    url: 'https://youtube.minyvinyl.com'
  },
  { 
    name: 'Apple Music', 
    icon: Apple, 
    color: 'bg-pink-500',
    url: 'https://applemusic.minyvinyl.com'
  },
  { 
    name: 'Discogs', 
    icon: Disc, 
    color: 'bg-orange-500',
    url: 'https://discogs.minyvinyl.com'
  },
  { 
    name: 'Last.fm', 
    icon: Radio, 
    color: 'bg-red-600',
    url: 'https://lastfm.minyvinyl.com'
  },
  { 
    name: 'By Genre', 
    icon: Hash, 
    color: 'bg-purple-500',
    url: 'https://genre.minyvinyl.com'
  },
  { 
    name: 'By Artist', 
    icon: User2, 
    color: 'bg-blue-500',
    url: 'https://artist.minyvinyl.com'
  }
];

export const MixtapeCards: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {platforms.map((platform) => (
        <a
          key={platform.name}
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative bg-gray-800 rounded-xl p-6 flex flex-col items-center justify-center gap-3 border border-gray-700/50 hover:border-purple-500/50 transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10"
        >
          <div className={`p-3 rounded-lg ${platform.color}/10 group-hover:${platform.color}/20 transition-colors`}>
            <platform.icon className={`w-8 h-8 ${platform.color} text-white`} />
          </div>
          <h4 className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
            {platform.name}
          </h4>
        </a>
      ))}
    </div>
  );
};