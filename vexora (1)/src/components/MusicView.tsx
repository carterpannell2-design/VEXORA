import React, { useState, useEffect } from 'react';
import { Music, Search, ExternalLink, Play, Disc, Trash2, Plus, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Service = 'spotify' | 'youtube' | 'soundcloud';

interface SavedTrack {
  id: string;
  name: string;
  url: string;
  service: Service;
  createdAt: number;
}

export const MusicView: React.FC = () => {
  const [activeService, setActiveService] = useState<Service>('spotify');
  const [customUrl, setCustomUrl] = useState('');
  const [currentEmbed, setCurrentEmbed] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newTrackName, setNewTrackName] = useState('');

  // Load saved tracks from local storage
  const [savedTracks, setSavedTracks] = useState<SavedTrack[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('vexora_music_picks');
    return saved ? JSON.parse(saved) : [];
  });

  // Save tracks to local storage
  useEffect(() => {
    localStorage.setItem('vexora_music_picks', JSON.stringify(savedTracks));
  }, [savedTracks]);

  const [searchMessage, setSearchMessage] = useState<{text: string, type: 'info' | 'error'} | null>(null);
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    title: string;
    thumbnail: string;
    author: string;
    timestamp: string;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Clear message and results when service changes
  useEffect(() => {
    setSearchMessage(null);
    setSearchResults([]);
  }, [activeService]);

  const handleSearchOrPlay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl) return;

    // Simple URL check
    const isUrl = customUrl.includes('http://') || customUrl.includes('https://');

    if (isUrl) {
      let embedUrl = customUrl;
      
      // URL transformation logic
      if (activeService === 'spotify' && !customUrl.includes('embed')) {
        embedUrl = customUrl.replace('open.spotify.com/', 'open.spotify.com/embed/');
      } else if (activeService === 'youtube' && customUrl.includes('watch?v=')) {
        embedUrl = customUrl.replace('watch?v=', 'embed/');
      }

      setCurrentEmbed(embedUrl);
      setCustomUrl('');
      setSearchMessage(null);
      setSearchResults([]);
    } else {
      // Search logic
      const query = encodeURIComponent(customUrl);
      
      if (activeService === 'youtube') {
        setIsSearching(true);
        setSearchMessage(null);
        setSearchResults([]);
        
        try {
          const res = await fetch(`/api/youtube/search?q=${query}`);
          if (!res.ok) throw new Error('Search failed');
          const data = await res.json();
          setSearchResults(data);
          setCustomUrl('');
        } catch (err) {
          console.error(err);
          setSearchMessage({
            text: 'Failed to search YouTube. Please try again.',
            type: 'error'
          });
          // Fallback to embed search if API fails
          setCurrentEmbed(`https://www.youtube.com/embed?listType=search&list=${query}`);
        } finally {
          setIsSearching(false);
        }
      } else {
        // Others require external search
        let searchUrl = '';
        if (activeService === 'spotify') searchUrl = `https://open.spotify.com/search/${query}`;
        else if (activeService === 'soundcloud') searchUrl = `https://soundcloud.com/search?q=${query}`;
        
        window.open(searchUrl, '_blank');
        setCustomUrl('');
        setSearchMessage({
          text: `Opened ${activeService === 'spotify' ? 'Spotify' : 'SoundCloud'} search in a new tab. In-app search is only available for YouTube.`,
          type: 'info'
        });
        
        // Clear message after 5 seconds
        setTimeout(() => setSearchMessage(null), 5000);
      }
    }
  };

  const handleSaveTrack = () => {
    if (!currentEmbed || !newTrackName.trim()) return;

    const newTrack: SavedTrack = {
      id: crypto.randomUUID(),
      name: newTrackName.trim(),
      url: currentEmbed,
      service: activeService,
      createdAt: Date.now()
    };

    setSavedTracks(prev => [newTrack, ...prev]);
    setIsSaving(false);
    setNewTrackName('');
  };

  const handleDeleteTrack = (id: string) => {
    setSavedTracks(prev => prev.filter(t => t.id !== id));
  };

  const filteredTracks = savedTracks.filter(t => t.service === activeService);

  return (
    <div className="h-full flex flex-col bg-black text-white p-8 overflow-y-auto custom-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto w-full"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Music size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Music Station</h1>
            <p className="text-zinc-400">Stream your favorite tracks</p>
          </div>
        </div>

        {/* Service Selection */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveService('spotify')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeService === 'spotify' 
                ? 'bg-[#1DB954] text-black shadow-lg shadow-[#1DB954]/20' 
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <Disc size={20} />
            Spotify
          </button>
          <button
            onClick={() => setActiveService('youtube')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeService === 'youtube' 
                ? 'bg-[#FF0000] text-white shadow-lg shadow-[#FF0000]/20' 
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <Play size={20} />
            YouTube Music
          </button>
          <button
            onClick={() => setActiveService('soundcloud')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeService === 'soundcloud' 
                ? 'bg-[#FF5500] text-white shadow-lg shadow-[#FF5500]/20' 
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <Music size={20} />
            SoundCloud
          </button>
        </div>

        {/* Player Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Player */}
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative">
              {currentEmbed ? (
                <iframe 
                  src={currentEmbed} 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                  loading="lazy"
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 p-8 text-center">
                  <Music size={48} className="mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No track selected</p>
                  <p className="text-sm opacity-70">Paste a URL to play, or type a song name to search on {activeService}.</p>
                </div>
              )}
            </div>

            {/* Controls & Save */}
            <div className="flex items-center justify-between gap-4">
               {currentEmbed && (
                 !isSaving ? (
                   <button 
                     onClick={() => setIsSaving(true)}
                     className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors"
                   >
                     <Plus size={16} />
                     Add to Quick Picks
                   </button>
                 ) : (
                   <div className="flex items-center gap-2 flex-1 max-w-md">
                     <input
                       type="text"
                       value={newTrackName}
                       onChange={(e) => setNewTrackName(e.target.value)}
                       placeholder="Name this track..."
                       className="flex-1 bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                       autoFocus
                     />
                     <button 
                       onClick={handleSaveTrack}
                       disabled={!newTrackName.trim()}
                       className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-colors"
                     >
                       <Save size={16} />
                     </button>
                     <button 
                       onClick={() => setIsSaving(false)}
                       className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                     >
                       <X size={16} />
                     </button>
                   </div>
                 )
               )}
            </div>

            {/* Search / URL Input */}
            <form onSubmit={handleSearchOrPlay} className="relative">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder={activeService === 'youtube' ? "Search for a song or paste URL..." : `Paste ${activeService} URL (or type to search externally)...`}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                {customUrl.includes('http') ? <Play size={16} /> : <Search size={16} />}
              </button>
            </form>
            
            {/* Search Results */}
            {isSearching && (
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold">Search Results</h3>
                  <button 
                    onClick={() => setSearchResults([])}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    Clear Results
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {searchResults.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => {
                        setCurrentEmbed(`https://www.youtube.com/embed/${video.id}`);
                        setSearchResults([]);
                        setSearchMessage(null);
                      }}
                      className="flex gap-3 p-3 bg-zinc-800/50 hover:bg-zinc-700 rounded-xl text-left transition-all group border border-white/5 hover:border-white/10"
                    >
                      <div className="relative w-24 h-16 shrink-0">
                        <img 
                          src={video.thumbnail} 
                          alt={video.title} 
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors rounded-lg" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="font-medium text-sm text-zinc-200 group-hover:text-white truncate leading-tight mb-1">
                          {video.title}
                        </h4>
                        <p className="text-xs text-zinc-500 truncate">
                          {video.author} • {video.timestamp}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {searchMessage && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-sm mt-2 ${searchMessage.type === 'error' ? 'text-red-400' : 'text-indigo-300'}`}
              >
                {searchMessage.text}
              </motion.p>
            )}
            
            <p className="text-xs text-zinc-500 ml-1 mt-2">
              * YouTube supports direct search. Spotify/SoundCloud require pasting a direct link.
            </p>
          </div>

          {/* Quick Picks (User Defined) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Your Quick Picks</h3>
              <span className="text-xs text-zinc-500">{filteredTracks.length} saved</span>
            </div>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredTracks.length === 0 ? (
                <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-zinc-500">
                  <p className="text-sm">No saved tracks yet.</p>
                  <p className="text-xs mt-1 opacity-70">Play a track and click "Add to Quick Picks" to save it here.</p>
                </div>
              ) : (
                <AnimatePresence>
                  {filteredTracks.map((track) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="group relative"
                    >
                      <button
                        onClick={() => setCurrentEmbed(track.url)}
                        className="w-full p-4 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-xl text-left transition-all flex items-center gap-4 pr-12"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          track.service === 'spotify' ? 'bg-[#1DB954]/20 text-[#1DB954]' :
                          track.service === 'youtube' ? 'bg-[#FF0000]/20 text-[#FF0000]' :
                          'bg-[#FF5500]/20 text-[#FF5500]'
                        }`}>
                          <Play size={16} className="ml-0.5" />
                        </div>
                        <span className="font-medium group-hover:text-white text-zinc-300 transition-colors truncate">
                          {track.name}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteTrack(track.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
            
            <div className="mt-8 p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
              <h4 className="font-bold text-indigo-300 mb-2">How to use</h4>
              <ul className="text-sm text-indigo-200/70 space-y-2 list-disc list-inside">
                <li>Search for a song (opens new tab)</li>
                <li>Copy the URL from the browser</li>
                <li>Paste it here to play</li>
                <li>Click "Add to Quick Picks" to save</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
