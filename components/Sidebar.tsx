
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onNewNote: () => void;
  onOpenTemplates: () => void;
  onHide: () => void;
  width: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange, 
  onNewNote, 
  onOpenTemplates,
  onHide, 
  width 
}) => {
  const NavItem = ({ view, icon, label }: { view: AppView, icon: string, label: string }) => {
    const isActive = currentView === view;
    return (
      <button 
        onClick={() => onViewChange(view)}
        className={`w-full flex items-center gap-3 px-3 py-2 sm:py-2.5 rounded-xl transition-all group ${isActive ? 'bg-primary text-primary-text' : 'text-slate-600 dark:text-zinc-400 hover:bg-yellow-100/50 dark:hover:bg-zinc-800'}`}
      >
        <span className={`material-symbols-outlined text-[20px] sm:text-[22px] ${isActive ? 'fill' : ''}`}>{icon}</span>
        <span className={`text-xs sm:text-sm ${isActive ? 'font-bold' : 'font-semibold'} truncate`}>{label}</span>
      </button>
    );
  };

  return (
    <aside 
      className="border-r border-slate-200 dark:border-zinc-800 bg-background-light dark:bg-zinc-900 flex flex-col h-full shrink-0 transition-colors overflow-hidden"
      style={{ width: `${width}px` }}
    >
      <div className="p-4 sm:p-6 flex flex-col gap-6 sm:gap-8 h-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-primary size-7 sm:size-8 rounded-lg flex items-center justify-center text-primary-text shadow-sm">
              <span className="material-symbols-outlined text-[18px] sm:text-[20px]">psychology</span>
            </div>
            <div className="overflow-hidden">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight dark:text-white truncate">Smart AI Notes</h1>
            </div>
          </div>
          <button 
            onClick={onHide}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">menu_open</span>
          </button>
        </div>

        <nav className="flex flex-col gap-1 sm:gap-1.5 flex-1">
          <NavItem view={AppView.ALL_NOTES} icon="description" label="All Notes" />
          <NavItem view={AppView.FAVORITES} icon="star" label="Favorites" />
          <NavItem view={AppView.FOLDERS} icon="folder" label="Folders" />
          <NavItem view={AppView.AI_ASSISTANT} icon="auto_awesome" label="AI Assistant" />
          
          <div className="mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-yellow-200/40 dark:border-zinc-800">
            <button 
              onClick={() => onViewChange(AppView.SETTINGS)}
              className={`w-full flex items-center gap-3 px-3 py-2 sm:py-2.5 rounded-xl transition-all group ${currentView === AppView.SETTINGS ? 'bg-primary text-primary-text' : 'text-slate-600 dark:text-zinc-400 hover:bg-yellow-100/50 dark:hover:bg-zinc-800'}`}
            >
              <span className={`material-symbols-outlined text-[20px] sm:text-[22px] ${currentView === AppView.SETTINGS ? 'fill' : ''}`}>settings</span>
              <span className="text-xs sm:text-sm font-semibold truncate">Settings</span>
            </button>
          </div>
        </nav>

        <div className="mt-auto flex flex-col gap-2 sm:gap-3">
          <button 
            onClick={onNewNote}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-text font-bold py-2.5 sm:py-3 rounded-xl transition-all shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">add</span>
            <span className="text-xs sm:text-sm truncate">New Note</span>
          </button>
          
          <button 
            onClick={onOpenTemplates}
            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 font-bold py-2 sm:py-2.5 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-zinc-700 active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px] text-yellow-600">auto_stories</span>
            <span className="text-[10px] sm:text-xs truncate">Templates</span>
          </button>

          <div className="pt-2 text-[9px] sm:text-[10px] text-slate-400 dark:text-zinc-500 font-medium text-center">
            Made by Yash Khandelwal
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
