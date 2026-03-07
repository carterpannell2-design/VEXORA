import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Home, 
  Palette,
  Shield,
  Type,
  Gamepad2,
  Search,
  X,
  Maximize2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Theme = 'nebula' | 'midnight' | 'emerald' | 'sunset' | 'brutalist';

import { initAdBlocker, updateAdBlocker } from './services/adBlocker';

interface SettingsState {
  theme: Theme;
  tabName: string;
  tabIcon: string;
  antiClose: boolean;
  aboutBlank: boolean;
  adBlocker: boolean;
}

// --- Constants ---

const GAMES = [
  {
    id: '10-minutes-till-dawn',
    title: '10 Minutes Till Dawn',
    category: 'Action',
    image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=800&q=80',
    url: '/games/10-minutes-till-dawn.html'
  },
  {
    id: 'battlefield',
    title: 'Battlefield',
    category: 'Shooter',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070',
    url: '/games/battlefield.html'
  },
  {
    id: 'minecraft',
    title: 'Minecraft',
    category: 'Sandbox',
    image: 'https://images.unsplash.com/photo-1607513746994-51f730a44832?auto=format&fit=crop&w=800&q=80',
    url: '/games/minecraft.html'
  },
  {
    id: 'ultrakill',
    title: 'ULTRAKILL',
    category: 'Shooter',
    image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=800&q=80',
    url: '/games/ultrakill.html'
  }
];

const THEMES: Record<Theme, { name: string; colors: string; bg: string; particleColor: string }> = {
  nebula: {
    name: 'Nebula',
    colors: 'from-indigo-600 to-purple-600',
    bg: 'bg-[#05050a]',
    particleColor: '#818cf8'
  },
  midnight: {
    name: 'Midnight',
    colors: 'from-zinc-700 to-zinc-900',
    bg: 'bg-black',
    particleColor: '#ffffff'
  },
  emerald: {
    name: 'Emerald',
    colors: 'from-emerald-600 to-teal-600',
    bg: 'bg-[#020a05]',
    particleColor: '#10b981'
  },
  sunset: {
    name: 'Sunset',
    colors: 'from-orange-500 to-rose-500',
    bg: 'bg-[#0a0505]',
    particleColor: '#f43f5e'
  },
  brutalist: {
    name: 'Brutalist',
    colors: 'from-yellow-400 to-yellow-500',
    bg: 'bg-white',
    particleColor: '#000000'
  }
};

// --- Components ---

const FallingParticles: React.FC<{ color: string }> = ({ color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 10000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speed: Math.random() * 1 + 0.5,
          opacity: Math.random() * 0.5 + 0.1
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;

      particles.forEach(p => {
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        p.y += p.speed;
        if (p.y > canvas.height) {
          p.y = -p.size;
          p.x = Math.random() * canvas.width;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [color]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center">
      <div className="text-6xl md:text-8xl font-bold tracking-tighter mb-2 font-mono">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
      </div>
      <div className="text-zinc-500 text-xl md:text-2xl font-medium">
        {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'games' | 'settings'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<typeof GAMES[0] | null>(null);

  const [settings, setSettings] = useState<SettingsState>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('vexora-settings') : null;
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.adBlocker === undefined) parsed.adBlocker = true;
      return parsed;
    }
    return {
      theme: 'nebula',
      tabName: 'Vexora',
      tabIcon: 'https://www.google.com/favicon.ico',
      antiClose: false,
      aboutBlank: false,
      adBlocker: true
    };
  });

  // Initialize AdBlocker
  useEffect(() => {
    initAdBlocker(settings.adBlocker);
  }, []);

  // Update AdBlocker when setting changes
  useEffect(() => {
    updateAdBlocker(settings.adBlocker);
  }, [settings.adBlocker]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('vexora-settings', JSON.stringify(settings));
    document.title = settings.tabName;
    
    // Update favicon
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = settings.tabIcon;
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = settings.tabIcon;
      document.head.appendChild(newLink);
    }

    // Anti-close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (settings.antiClose) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    if (settings.antiClose) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }

    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [settings]);

  const filteredGames = GAMES.filter(game => 
    game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    game.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAboutBlank = () => {
    const win = window.open('about:blank', '_blank');
    if (!win) return;
    win.document.body.style.margin = '0';
    win.document.body.style.height = '100vh';
    const iframe = win.document.createElement('iframe');
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.src = window.location.href;
    win.document.body.appendChild(iframe);
  };

  return (
    <div className={`min-h-screen ${THEMES[settings.theme].bg} text-white font-sans selection:bg-indigo-500/30 overflow-hidden relative`}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <FallingParticles color={THEMES[settings.theme].particleColor} />
        {settings.theme === 'nebula' && (
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px] animate-pulse delay-700" />
          </div>
        )}
        {settings.theme === 'emerald' && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent" />
          </div>
        )}
        {settings.theme === 'sunset' && (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-500/20 via-rose-500/10 to-transparent" />
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className="flex h-screen relative z-10">
        
        {/* Sidebar */}
        <nav className="w-20 md:w-24 border-r border-white/5 bg-black/20 backdrop-blur-xl flex flex-col items-center py-8 gap-8">
          <div className="flex-1 flex flex-col gap-4">
            <NavButton 
              active={activeTab === 'home'} 
              onClick={() => setActiveTab('home')} 
              icon={<Home size={24} />} 
              label="Home"
            />
            <NavButton 
              active={activeTab === 'games'} 
              onClick={() => setActiveTab('games')} 
              icon={<Gamepad2 size={24} />} 
              label="Games"
            />
          </div>

          <div className="mt-auto">
            <NavButton 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')} 
              icon={<Settings size={24} />} 
              label="Settings"
            />
          </div>
        </nav>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="h-full flex flex-col items-center justify-center p-8"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-12"
                >
                  <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/20">
                    VEXORA
                  </h1>
                  <div className="h-1 w-24 bg-indigo-500 mx-auto rounded-full mb-8" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Clock />
                </motion.div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  onClick={() => setActiveTab('games')}
                  className="mt-12 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium tracking-wide transition-all border border-white/10 hover:border-white/30 flex items-center gap-3"
                >
                  <Gamepad2 size={20} />
                  Enter Library
                </motion.button>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-16 text-zinc-500 text-sm uppercase tracking-[0.2em]"
                >
                  Pure Minimalist Experience
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'games' && (
              <motion.div 
                key="games"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8 md:p-12"
              >
                <div className="max-w-6xl mx-auto">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                      <h1 className="text-4xl font-bold mb-2">Library</h1>
                      <p className="text-zinc-400">Your personal collection</p>
                    </div>
                    <div className="relative w-full md:w-96">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                      <input
                        type="text"
                        placeholder="Search games..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredGames.map((game, i) => (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedGame(game)}
                        className="group relative aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all"
                      >
                        <img src={game.image} alt={game.title} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-6">
                          <div className="text-xs font-bold tracking-wider text-indigo-400 mb-2 uppercase">{game.category}</div>
                          <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">{game.title}</h3>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8 md:p-12 max-w-4xl mx-auto"
              >
                <h1 className="text-4xl font-bold mb-12">Settings</h1>

                <div className="space-y-8">
                  {/* Theme Selection */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                        <Palette size={20} />
                      </div>
                      <h2 className="text-xl font-semibold">Appearance</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {(Object.keys(THEMES) as Theme[]).map(t => (
                        <button
                          key={t}
                          onClick={() => setSettings(s => ({ ...s, theme: t }))}
                          className={`p-4 rounded-2xl border transition-all text-left group ${
                            settings.theme === t 
                              ? 'bg-white/10 border-indigo-500 ring-2 ring-indigo-500/20' 
                              : 'bg-white/5 border-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${THEMES[t].colors} mb-3 shadow-lg`} />
                          <span className={`text-sm font-medium ${settings.theme === t ? 'text-white' : 'text-zinc-400'}`}>
                            {THEMES[t].name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Tab Customization */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <Type size={20} />
                      </div>
                      <h2 className="text-xl font-semibold">Tab Cloaking</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm text-zinc-400 ml-1">Tab Name</label>
                        <input 
                          type="text" 
                          value={settings.tabName}
                          onChange={(e) => setSettings(s => ({ ...s, tabName: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-zinc-400 ml-1">Tab Icon URL</label>
                        <input 
                          type="text" 
                          value={settings.tabIcon}
                          onChange={(e) => setSettings(s => ({ ...s, tabIcon: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Security/Utility */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                        <Shield size={20} />
                      </div>
                      <h2 className="text-xl font-semibold">Utility</h2>
                    </div>
                    <div className="space-y-4">
                      <Toggle 
                        label="Anti-Close" 
                        description="Prevents the tab from being closed accidentally by showing a confirmation dialog."
                        enabled={settings.antiClose}
                        onToggle={() => setSettings(s => ({ ...s, antiClose: !s.antiClose }))}
                      />
                       <Toggle 
                        label="Auto about:blank" 
                        description="Automatically attempts to open the site in a blank window on startup (Experimental)."
                        enabled={settings.aboutBlank}
                        onToggle={() => setSettings(s => ({ ...s, aboutBlank: !s.aboutBlank }))}
                      />
                      <Toggle 
                        label="Vexora AdBlocker" 
                        description="Blocks intrusive ads and trackers in games and across the web."
                        enabled={settings.adBlocker}
                        onToggle={() => setSettings(s => ({ ...s, adBlocker: !s.adBlocker }))}
                      />
                    </div>
                  </section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-6xl h-[80vh] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 bg-zinc-950 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-lg">{selectedGame.title}</h3>
                  <span className="px-2 py-1 bg-white/10 rounded text-xs font-medium text-zinc-400">
                    {selectedGame.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const iframe = document.getElementById('game-frame') as HTMLIFrameElement;
                      if (iframe) iframe.src = iframe.src;
                    }}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Reload Game"
                  >
                    <RefreshCw size={20} />
                  </button>
                  <button
                    onClick={() => window.open(selectedGame.url, '_blank')}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Open in New Tab"
                  >
                    <ExternalLink size={20} />
                  </button>
                  <button
                    onClick={() => {
                      const iframe = document.getElementById('game-frame');
                      if (iframe) {
                        if (iframe.requestFullscreen) iframe.requestFullscreen();
                      }
                    }}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize2 size={20} />
                  </button>
                  <div className="w-px h-6 bg-white/10 mx-2" />
                  <button
                    onClick={() => setSelectedGame(null)}
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="flex-1 relative bg-black">
                <iframe
                  id="game-frame"
                  src={selectedGame.url}
                  className="absolute inset-0 w-full h-full border-none"
                  allow="fullscreen; autoplay; gamepad; clipboard-read; clipboard-write"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => {
  return (
    <button 
      onClick={onClick}
      className={`relative group p-3 rounded-2xl transition-all duration-300 ${
        active 
          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
          : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="active-nav"
          className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-full"
        />
      )}
    </button>
  );
}

function Toggle({ label, description, enabled, onToggle }: { label: string; description: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
      <div className="flex-1 pr-4">
        <h4 className="font-medium mb-1">{label}</h4>
        <p className="text-sm text-zinc-500">{description}</p>
      </div>
      <button 
        onClick={onToggle}
        className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-indigo-500' : 'bg-zinc-700'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );
}
