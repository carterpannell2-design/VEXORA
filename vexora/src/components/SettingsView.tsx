import React from 'react';
import { Settings, Palette, Type, Shield, AlertTriangle, Image as ImageIcon, Layout } from 'lucide-react';
import { motion } from 'motion/react';

export type Theme = 'nebula' | 'midnight' | 'emerald' | 'sunset' | 'brutalist' | 'performance-dark' | 'performance-light';

export interface SettingsState {
  theme: Theme;
  tabName: string;
  tabIcon: string;
  antiClose: boolean;
  aboutBlank: boolean;
  adBlocker: boolean;
  panicKey: string;
  panicUrl: string;
  customBackground: string;
}

export const THEMES: Record<Theme, { name: string; colors: string; bg: string; particleColor: string; textColor: string }> = {
  nebula: {
    name: 'Nebula',
    colors: 'from-indigo-600 to-purple-600',
    bg: 'bg-[#05050a]',
    particleColor: '#818cf8',
    textColor: 'text-white'
  },
  midnight: {
    name: 'Midnight',
    colors: 'from-zinc-700 to-zinc-900',
    bg: 'bg-black',
    particleColor: '#ffffff',
    textColor: 'text-white'
  },
  emerald: {
    name: 'Emerald',
    colors: 'from-emerald-400 to-teal-600',
    bg: 'bg-[#061c13]',
    particleColor: '#34d399',
    textColor: 'text-white'
  },
  sunset: {
    name: 'Sunset',
    colors: 'from-orange-500 via-rose-500 to-amber-500',
    bg: 'bg-gradient-to-br from-[#2a0800] via-[#4a1515] to-[#1a0a0a]',
    particleColor: '#f59e0b',
    textColor: 'text-white'
  },
  brutalist: {
    name: 'Brutalist',
    colors: 'from-black to-black border-4 border-white',
    bg: 'bg-[#e5e5e5]',
    particleColor: '#000000',
    textColor: 'text-black'
  },
  'performance-dark': {
    name: 'Performance (Dark)',
    colors: 'from-black to-black border border-zinc-800',
    bg: 'bg-black',
    particleColor: 'transparent',
    textColor: 'text-white'
  },
  'performance-light': {
    name: 'Performance (Light)',
    colors: 'from-white to-white border border-zinc-200',
    bg: 'bg-white',
    particleColor: 'transparent',
    textColor: 'text-black'
  }
};

const CLOAK_PRESETS = [
  { name: 'Google', icon: 'https://www.google.com/favicon.ico', title: 'Google' },
  { name: 'Google Classroom', icon: 'https://ssl.gstatic.com/classroom/favicon.png', title: 'Home' },
  { name: 'Google Drive', icon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png', title: 'My Drive - Google Drive' },
  { name: 'Gmail', icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/rfr/gmail.ico', title: 'Inbox (1) - Gmail' },
  { name: 'Zoom', icon: 'https://st1.zoom.us/zoom.ico', title: 'Zoom Meeting' },
  { name: 'Wikipedia', icon: 'https://en.wikipedia.org/static/favicon/wikipedia.ico', title: 'Wikipedia' },
];

interface SettingsViewProps {
  settings: SettingsState;
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>;
  onOpenAboutBlank: () => void;
}

const Toggle: React.FC<{ label: string; description: string; enabled: boolean; onToggle: () => void }> = ({ label, description, enabled, onToggle }) => (
  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
    <div>
      <div className="font-medium mb-1">{label}</div>
      <div className="text-xs text-zinc-400 max-w-md">{description}</div>
    </div>
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-indigo-500' : 'bg-zinc-700'}`}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  </div>
);

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, setSettings, onOpenAboutBlank }) => {
  return (
    <div className="p-8 md:p-12 max-w-4xl mx-auto pb-24">
      <h1 className="text-4xl font-bold mb-12">Settings</h1>

      <div className="space-y-12">
        {/* Theme Selection */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Palette size={20} />
            </div>
            <h2 className="text-xl font-semibold">Appearance</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
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
                <span className={`text-sm font-medium ${settings.theme === t ? THEMES[settings.theme].textColor : 'text-zinc-400'}`}>
                  {THEMES[t].name}
                </span>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400 ml-1 flex items-center gap-2">
              <ImageIcon size={14} />
              Custom Background URL (Optional)
            </label>
            <input 
              type="text" 
              placeholder="https://example.com/image.jpg"
              value={settings.customBackground || ''}
              onChange={(e) => setSettings(s => ({ ...s, customBackground: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600"
            />
            <p className="text-xs text-zinc-500 ml-1">Overrides the theme background. Clear to use theme default.</p>
          </div>
        </section>

        {/* Tab Cloaking */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Type size={20} />
            </div>
            <h2 className="text-xl font-semibold">Tab Cloaking</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            {CLOAK_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setSettings(s => ({ ...s, tabName: preset.title, tabIcon: preset.icon }))}
                className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl transition-all"
              >
                <img src={preset.icon} alt={preset.name} className="w-6 h-6" />
                <span className="text-xs text-zinc-400">{preset.name}</span>
              </button>
            ))}
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

        {/* Panic Button */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <AlertTriangle size={20} />
            </div>
            <h2 className="text-xl font-semibold">Panic Button</h2>
          </div>
          
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-6 mb-6">
            <p className="text-sm text-amber-200/80 mb-4">
              Quickly redirect to a safe site when you press the configured key.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400 ml-1">Panic Key</label>
                <input 
                  type="text" 
                  placeholder="e.g. ` or Escape"
                  value={settings.panicKey || ''}
                  onChange={(e) => setSettings(s => ({ ...s, panicKey: e.target.value }))}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                <p className="text-xs text-zinc-500">Press this key to activate.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400 ml-1">Redirect URL</label>
                <input 
                  type="text" 
                  placeholder="https://google.com"
                  value={settings.panicUrl || 'https://google.com'}
                  onChange={(e) => setSettings(s => ({ ...s, panicUrl: e.target.value }))}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
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
            <button
              onClick={onOpenAboutBlank}
              className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-xl transition-all flex items-center justify-between group"
            >
              <div className="text-left">
                <div className="font-medium mb-1 group-hover:text-indigo-400 transition-colors">Open in about:blank</div>
                <div className="text-xs text-zinc-400">Cloak the site in a blank page to hide it from history and extensions.</div>
              </div>
              <ExternalLink size={20} className="text-zinc-500 group-hover:text-indigo-400 transition-colors" />
            </button>

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
    </div>
  );
};
