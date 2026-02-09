
import React from 'react';

interface SettingsViewProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onResetData: () => void;
  onBackup: () => void;
  onLogout: () => void;
  notesCount: number;
  onShowSidebar: () => void;
  sidebarHidden: boolean;
  isMobile?: boolean;
  onBack?: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  isDarkMode, 
  onToggleDarkMode, 
  onResetData, 
  onBackup,
  onLogout,
  notesCount, 
  onShowSidebar, 
  sidebarHidden,
  isMobile,
  onBack
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-12 bg-white dark:bg-zinc-900 relative no-scrollbar">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10">
          {(sidebarHidden || isMobile) && (
            <button 
              onClick={isMobile ? onBack : onShowSidebar}
              className="p-1 -ml-1 text-slate-400 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">{isMobile ? 'arrow_back' : 'menu'}</span>
            </button>
          )}
          <h2 className="text-lg sm:text-3xl font-extrabold dark:text-white">Settings</h2>
        </div>
        
        <div className="space-y-5 sm:space-y-12">
          {/* Section: Account */}
          <section>
            <h3 className="text-[8px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 sm:mb-6 ml-1">Account</h3>
            <div className="bg-slate-50 dark:bg-zinc-800 rounded-xl sm:rounded-3xl p-3.5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between border border-slate-100 dark:border-zinc-700 shadow-sm gap-2.5 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="size-8 sm:size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px] sm:text-[24px]">person</span>
                </div>
                <div>
                  <p className="text-[11px] sm:text-sm font-bold dark:text-white">Profile & Security</p>
                  <p className="text-[9px] sm:text-[11px] text-slate-500">Cloud Sync Active</p>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="w-full sm:w-auto px-3 py-1.5 bg-white dark:bg-zinc-700 border border-slate-200 dark:border-zinc-600 text-[9px] sm:text-xs font-bold text-red-600 rounded-lg sm:rounded-xl active:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          </section>

          {/* Section: Appearance */}
          <section>
            <h3 className="text-[8px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 sm:mb-6 ml-1">Appearance</h3>
            <div 
              onClick={onToggleDarkMode}
              className="bg-slate-50 dark:bg-zinc-800 rounded-xl sm:rounded-3xl p-3.5 sm:p-6 flex items-center justify-between border border-slate-100 dark:border-zinc-700 shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="size-8 sm:size-10 rounded-lg sm:rounded-2xl bg-white dark:bg-zinc-700 flex items-center justify-center shadow-sm text-slate-600 dark:text-zinc-300">
                  <span className="material-symbols-outlined text-[16px] sm:text-[20px]">{isDarkMode ? 'dark_mode' : 'light_mode'}</span>
                </div>
                <div>
                  <p className="text-[11px] sm:text-sm font-bold dark:text-white">Dark Mode</p>
                  <p className="text-[9px] sm:text-[11px] text-slate-500">Theme mode</p>
                </div>
              </div>
              <div className={`w-8 h-4 sm:w-12 sm:h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-primary' : 'bg-slate-300 dark:bg-zinc-600'}`}>
                <div className={`absolute top-0.5 sm:top-1 size-3 sm:size-4 rounded-full bg-white transition-all ${isDarkMode ? 'left-4.5 sm:left-7' : 'left-0.5 sm:left-1'}`}></div>
              </div>
            </div>
          </section>

          {/* Section: Data */}
          <section>
            <h3 className="text-[8px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 sm:mb-6 ml-1">Data</h3>
            <div 
              onClick={onBackup}
              className="bg-slate-50 dark:bg-zinc-800 rounded-xl sm:rounded-3xl p-3.5 sm:p-6 flex items-center justify-between border border-slate-100 dark:border-zinc-700 shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="size-8 sm:size-10 rounded-lg sm:rounded-2xl bg-white dark:bg-zinc-700 flex items-center justify-center shadow-sm text-slate-600 dark:text-zinc-300">
                  <span className="material-symbols-outlined text-[16px] sm:text-[20px]">cloud_download</span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] sm:text-sm font-bold dark:text-white">Export Backup</p>
                  <p className="text-[9px] sm:text-[11px] text-slate-500 truncate">{notesCount} notes</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-primary text-[16px] sm:text-[20px]">chevron_right</span>
            </div>
          </section>

          <section className="pb-12">
             <div className="bg-slate-50 dark:bg-zinc-800 rounded-xl sm:rounded-3xl p-5 sm:p-8 text-center border border-slate-100 dark:border-zinc-700 shadow-sm">
                <div className="bg-primary size-8 sm:size-12 rounded-xl flex items-center justify-center text-slate-900 mx-auto mb-2 sm:mb-4">
                  <span className="material-symbols-outlined text-[18px] sm:text-[28px]">psychology</span>
                </div>
                <h4 className="font-bold text-[11px] sm:text-base dark:text-white">Smart AI Notes</h4>
                <p className="text-[8px] sm:text-[10px] text-slate-500 mb-2 italic">v2.1-mobile-opt</p>
                <div className="flex justify-center gap-3">
                  <button type="button" className="text-[8px] sm:text-[10px] font-bold text-slate-400">Privacy</button>
                  <button type="button" className="text-[8px] sm:text-[10px] font-bold text-slate-400">Terms</button>
                </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
