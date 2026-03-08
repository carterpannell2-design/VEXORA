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
  ExternalLink,
  Bot,
  Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatView } from './components/ChatView';
import { MusicView } from './components/MusicView';
import { SettingsView, SettingsState, THEMES, Theme } from './components/SettingsView';

import { initAdBlocker, updateAdBlocker } from './services/adBlocker';

// --- Constants ---

const GAMES = [
  {
    id: '10-minutes-till-dawn',
    title: '10 Minutes Till Dawn',
    category: 'Action',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1966900/header.jpg',
    url: './games/10-minutes-till-dawn.html'
  },
  {
    id: 'cluster-truck',
    title: 'Cluster Truck',
    category: 'Action',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/397950/header.jpg',
    url: './games/cluster-truck.html'
  },
  {
    id: 'basketball-bros',
    title: 'Basketball Bros',
    category: 'Sports',
    image: 'https://raw.githubusercontent.com/hushygames/hushygames.github.io/main/games/basketbrosio/logo.png',
    url: './games/basketball-bros.html'
  },
  {
    id: 'binding-of-isaac',
    title: 'The Binding of Isaac',
    category: 'Roguelike',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/113200/header.jpg',
    url: 'https://db.quackprep.org/html/thebindingofisaac/index.html'
  },
  {
    id: 'bloons-td5',
    title: 'Bloons TD 5',
    category: 'Strategy',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/306020/header.jpg',
    url: 'https://www.gameflare.com/embed/bloons-tower-defense-5/',
    scale: 1.1,
    offsetY: -5
  },
  {
    id: 'buckshot-roulette',
    title: 'Buckshot Roulette',
    category: 'Action',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2835570/header.jpg',
    url: 'https://buckshotroulette.com/home',
    scale: 1.2,
    offsetY: -12,
    offsetX: -10
  },
  {
    id: 'ragdoll-archers',
    title: 'Ragdoll Archers',
    category: 'Action',
    image: 'https://i.postimg.cc/HTn1YcS0/ragdoll-archers.jpg',
    url: './games/ragdoll-archers.html'
  },
  {
    id: 'ultrakill',
    title: 'Ultrakill',
    category: 'Action',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1229490/header.jpg',
    url: 'https://db.quackprep.org/html/ultrakill/index.html'
  },
  {
    id: 'brotato',
    title: 'Brotato',
    category: 'Action',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1942280/header.jpg',
    url: './games/brotato.html'
  },
  {
    id: 'eaglercraft',
    title: 'Minecraft (Eaglercraft)',
    category: 'Sandbox',
    image: 'https://www.minecraft.net/content/dam/games/minecraft/key-art/Games_Subnav_Minecraft-300x465.jpg',
    url: 'https://db.quackprep.org/html/minecraft/index.html'
  },
  {
    id: 'motox3m',
    title: 'Moto X3M',
    category: 'Racing',
    image: 'https://i.postimg.cc/FFNw27dN/motox3m.jpg',
    url: 'https://db.quackprep.org/html/motox3m/index.html'
  },
  {
    id: 'hollow-knight',
    title: 'Hollow Knight',
    category: 'Action',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/367520/header.jpg',
    url: 'https://db.quackprep.org/html/hollow_knight/index.html'
  },
  {
    id: 'basketball-stars',
    title: 'Basketball Stars',
    category: 'Sports',
    image: 'https://i.postimg.cc/SkQwdYbd/Basketball-stars.jpg',
    url: 'https://db.quackprep.org/html/basketball_stars/index.html'
  },
  {
    id: 'pvz',
    title: 'Plants vs Zombies',
    category: 'Strategy',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3590/header.jpg',
    url: 'https://db.quackprep.org/html/pvz/index.html'
  },
  {
    id: 'fnaf1',
    title: 'Five Nights at Freddy\'s',
    category: 'Horror',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/319510/header.jpg',
    url: 'https://db.quackprep.org/html/fnaf/index.html'
  },
  {
    id: 'fnaf2',
    title: 'Five Nights at Freddy\'s 2',
    category: 'Horror',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/332800/header.jpg',
    url: 'https://db.quackprep.org/html/fnaf2/index.html'
  },
  {
    id: 'fnaf3',
    title: 'Five Nights at Freddy\'s 3',
    category: 'Horror',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/354140/header.jpg',
    url: 'https://db.quackprep.org/html/fnaf3/index.html'
  },
  {
    id: 'fnaf4',
    title: 'Five Nights at Freddy\'s 4',
    category: 'Horror',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/388090/header.jpg',
    url: 'https://db.quackprep.org/html/fnaf4/index.html'
  },
  {
    id: 'among-us',
    title: 'Among Us',
    category: 'Action',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/945360/header.jpg',
    url: 'https://db.quackprep.org/html/among_us/index.html'
  },
  {
    id: 'snowrider3d',
    title: 'Snowrider 3D',
    category: 'Sports',
    image: 'https://img.gamepix.com/games/snow-rider-3d/icon/snow-rider-3d.png',
    url: 'https://db.quackprep.org/html/snow_rider_3d/index.html'
  },
  {
    id: 'incredibox',
    title: 'Incredibox',
    category: 'Music',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1549040/header.jpg',
    url: 'https://db.quackprep.org/html/incredibox/index.html'
  },
  {
    id: 'fnaf-world',
    title: 'FNAF World',
    category: 'RPG',
    image: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/427920/header.jpg',
    url: 'https://db2.quackprep.org/2024/more2/fnaf-world/pre.html'
  },
  {
    id: 'cod-zombies',
    title: 'CoD Zombies Portable',
    category: 'Action',
    image: 'https://i.postimg.cc/33VV3L0Y/nzp-zombies.jpg',
    url: 'https://db.quackprep.org/html/cod_zombies_portable/index.html'
  },
  {
    id: 'ragdoll-hit',
    title: 'Ragdoll Hit',
    category: 'Action',
    image: 'https://i.postimg.cc/YtGDD1nV/ragdoll-hit.jpg',
    url: 'https://db.quackprep.org/html/ragdoll_hit/index.html'
  },
  {
    id: 'retro-bowl',
    title: 'Retro Bowl',
    category: 'Sports',
    image: 'https://i.postimg.cc/R4bbTPRS/retro-bowl.png',
    url: 'https://db.quackprep.org/html/retro_bowl/index.html'
  },
  {
    id: 'deadly-descent',
    title: 'Deadly Descent',
    category: 'Action',
    image: 'https://i.postimg.cc/1mZdqfKp/deadly-decent.jpg',
    url: 'https://db.quackprep.org/html/deadly_descent/index.html'
  },
  {
    id: 'pixel-path',
    title: 'Pixel Path',
    category: 'Puzzle',
    image: 'https://i.postimg.cc/FmNqFkzm/pixel-path.jpg',
    url: 'https://db.quackprep.org/html/pixel_path/index.html'
  },
  {
    id: 'duck-life-1',
    title: 'Duck Life',
    category: 'Sports',
    image: 'https://i.postimg.cc/KGzMQ5Qk/duck-life-1-pic.webp',
    url: 'https://db.quackprep.org/html/duck_life/index.html'
  },
  {
    id: 'duck-life-2',
    title: 'Duck Life 2',
    category: 'Sports',
    image: 'https://i.postimg.cc/9WXRFB6n/Duck-Life2-OG-logo-jpg.webp',
    url: 'https://db.quackprep.org/html/duck_life_2/index.html'
  },
  {
    id: 'duck-life-3',
    title: 'Duck Life 3',
    category: 'Sports',
    image: 'https://i.postimg.cc/3KbRrQCy/Duck-Life3-OG-logo.jpg',
    url: 'https://db.quackprep.org/html/duck_life_3/index.html'
  },
  {
    id: 'duck-life-4',
    title: 'Duck Life 4',
    category: 'Sports',
    image: 'https://i.postimg.cc/RvgCGxYP/Duck-life-4.jpg',
    url: 'https://db.quackprep.org/html/duck_life_4/index.html'
  }
];

// THEMES constant removed - imported from SettingsView

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
  const [activeTab, setActiveTab] = useState<'home' | 'games' | 'chat' | 'music' | 'settings'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<typeof GAMES[0] | null>(null);

  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('vexora-settings') : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.adBlocker === undefined) parsed.adBlocker = true;
        // Default new settings
        if (parsed.panicKey === undefined) parsed.panicKey = '';
        if (parsed.panicUrl === undefined) parsed.panicUrl = 'https://google.com';
        if (parsed.customBackground === undefined) parsed.customBackground = '';
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse settings', e);
    }
    return {
      theme: 'nebula',
      tabName: 'Vexora',
      tabIcon: 'https://www.google.com/favicon.ico',
      antiClose: false,
      aboutBlank: false,
      adBlocker: true,
      panicKey: '',
      panicUrl: 'https://google.com',
      customBackground: ''
    };
  });

  // Panic Key Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (settings.panicKey && e.key.toLowerCase() === settings.panicKey.toLowerCase()) {
        window.location.href = settings.panicUrl;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.panicKey, settings.panicUrl]);

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
    <div className={`min-h-screen ${THEMES[settings.theme].bg} ${THEMES[settings.theme].textColor} font-sans selection:bg-indigo-500/30 overflow-hidden relative`}>
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {settings.customBackground ? (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url(${settings.customBackground})` }}
          />
        ) : (
          <>
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
          </>
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
              theme={settings.theme}
            />
            <NavButton 
              active={activeTab === 'games'} 
              onClick={() => setActiveTab('games')} 
              icon={<Gamepad2 size={24} />} 
              label="Games"
              theme={settings.theme}
            />
            <NavButton 
              active={activeTab === 'chat'} 
              onClick={() => setActiveTab('chat')} 
              icon={<Bot size={24} />} 
              label="AI Chat"
              theme={settings.theme}
            />
            <NavButton 
              active={activeTab === 'music'} 
              onClick={() => setActiveTab('music')} 
              icon={<Music size={24} />} 
              label="Music"
              theme={settings.theme}
            />
          </div>

          <div className="mt-auto">
            <NavButton 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')} 
              icon={<Settings size={24} />} 
              label="Settings"
              theme={settings.theme}
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
                  className={`mt-12 px-8 py-4 bg-white/10 hover:bg-white/20 ${THEMES[settings.theme].textColor} rounded-full font-medium tracking-wide transition-all border border-white/10 hover:border-white/30 flex items-center gap-3`}
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
                          <h3 className={`text-xl font-bold ${THEMES[settings.theme].textColor} group-hover:text-indigo-300 transition-colors`}>{game.title}</h3>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <ChatView />
              </motion.div>
            )}

            {activeTab === 'music' && (
              <motion.div 
                key="music"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <MusicView />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <SettingsView 
                  settings={settings} 
                  setSettings={setSettings} 
                  onOpenAboutBlank={openAboutBlank}
                />
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
                      if (iframe && selectedGame) {
                        // Hard reload by appending timestamp
                        const separator = selectedGame.url.includes('?') ? '&' : '?';
                        iframe.src = `${selectedGame.url}${separator}t=${Date.now()}`;
                      }
                    }}
                    className={`p-2 text-zinc-400 hover:${THEMES[settings.theme].textColor} hover:bg-white/10 rounded-lg transition-colors`}
                    title="Hard Reload Game"
                  >
                    <RefreshCw size={20} />
                  </button>
                  <button
                    onClick={() => {
                      if (selectedGame.id === 'buckshot-roulette' || selectedGame.id === 'binding-of-isaac') {
                        const win = window.open('about:blank', '_blank');
                        if (win) {
                          win.document.title = selectedGame.title;
                          win.document.body.style.margin = '0';
                          win.document.body.style.height = '100vh';
                          win.document.body.style.overflow = 'hidden';
                          win.document.body.style.backgroundColor = '#000';
                          
                          const iframe = win.document.createElement('iframe');
                          iframe.style.border = 'none';
                          iframe.style.width = '100%';
                          iframe.style.height = '100%';
                          iframe.style.margin = '0';
                          iframe.src = selectedGame.url;
                          iframe.allow = "autoplay; fullscreen; camera; focus-without-user-activation *; monetization; gamepad; keyboard-map *; xr-spatial-tracking; clipboard-write";
                          iframe.sandbox.add("allow-forms", "allow-modals", "allow-orientation-lock", "allow-pointer-lock", "allow-popups", "allow-popups-to-escape-sandbox", "allow-presentation", "allow-scripts", "allow-same-origin", "allow-downloads");
                          
                          win.document.body.appendChild(iframe);
                        }
                      } else {
                        window.open(selectedGame.url, '_blank');
                      }
                    }}
                    className={`p-2 text-zinc-400 hover:${THEMES[settings.theme].textColor} hover:bg-white/10 rounded-lg transition-colors`}
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
                    className={`p-2 text-zinc-400 hover:${THEMES[settings.theme].textColor} hover:bg-white/10 rounded-lg transition-colors`}
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
              <div className="flex-1 relative bg-black overflow-hidden">
                <iframe
                  id="game-frame"
                  src={selectedGame.url}
                  className="absolute border-none"
                  style={{
                    width: selectedGame.scale ? `${selectedGame.scale * 100}%` : '100%',
                    height: selectedGame.scale ? `${selectedGame.scale * 100}%` : '100%',
                    top: selectedGame.offsetY ? `${selectedGame.offsetY}%` : '0',
                    left: selectedGame.offsetX 
                      ? `${selectedGame.offsetX}%` 
                      : (selectedGame.scale ? `${(1 - selectedGame.scale) * 50}%` : '0'),
                  }}
                  allow="autoplay; fullscreen; camera; focus-without-user-activation *; monetization; gamepad; keyboard-map *; xr-spatial-tracking; clipboard-write; storage-access"
                  sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-scripts allow-same-origin allow-downloads"
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

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; theme: Theme }> = ({ active, onClick, icon, label, theme }) => {
  return (
    <button 
      onClick={onClick}
      className={`relative group p-3 rounded-2xl transition-all duration-300 ${
        active 
          ? `bg-indigo-500 ${THEMES[theme].textColor} shadow-lg shadow-indigo-500/20` 
          : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
      }`}
    >
      {icon}
      <span className={`absolute left-full ml-4 px-2 py-1 bg-zinc-800 ${THEMES[theme].textColor} text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50`}>
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
