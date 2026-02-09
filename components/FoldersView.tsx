
import React, { useState } from 'react';
import { Note } from '../types';

interface FoldersViewProps {
  notes: Note[];
  onNoteSelect: (id: string) => void;
  onFolderSelect: (folderName: string) => void;
  onFolderCreate: (folderName: string) => void;
  onShowSidebar: () => void;
  sidebarHidden: boolean;
  isMobile?: boolean;
  onBack?: () => void;
}

const FoldersView: React.FC<FoldersViewProps> = ({ 
  notes, 
  onNoteSelect, 
  onFolderSelect,
  onFolderCreate,
  onShowSidebar, 
  sidebarHidden,
  isMobile,
  onBack
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const folders = notes.reduce((acc, note) => {
    const folder = note.folder || 'Uncategorized';
    if (!acc[folder]) acc[folder] = [];
    acc[folder].push(note);
    return acc;
  }, {} as Record<string, Note[]>);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onFolderCreate(newFolderName.trim());
      setNewFolderName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-12 bg-slate-50/50 dark:bg-zinc-900/50 relative no-scrollbar">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-10">
          {(sidebarHidden || isMobile) && (
            <button 
              onClick={isMobile ? onBack : onShowSidebar}
              className="p-1 -ml-1 text-slate-400 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[24px]">{isMobile ? 'arrow_back' : 'menu'}</span>
            </button>
          )}
          <h2 className="text-lg sm:text-3xl font-extrabold dark:text-white">Folders</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {(Object.entries(folders) as [string, Note[]][]).map(([folderName, folderNotes]) => (
            <div 
              key={folderName} 
              onClick={() => onFolderSelect(folderName)}
              className="bg-white dark:bg-zinc-800 rounded-2xl sm:rounded-[32px] p-4 sm:p-8 border border-slate-100 dark:border-zinc-700 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="size-8 sm:size-10 rounded-lg sm:rounded-2xl bg-primary-soft dark:bg-yellow-900/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-text transition-colors">
                    <span className="material-symbols-outlined text-[18px] sm:text-[24px]">folder</span>
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-xs sm:text-base text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">{folderName}</h3>
                    <p className="text-[8px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider">{folderNotes.length} Notes</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1.5 sm:space-y-3">
                {folderNotes.slice(0, 3).map(note => (
                  <div 
                    key={note.id}
                    onClick={(e) => { e.stopPropagation(); onNoteSelect(note.id); }}
                    className="w-full text-left p-1.5 sm:p-3 rounded-lg sm:rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors group/note"
                  >
                    <p className="text-[10px] sm:text-xs font-bold text-slate-700 dark:text-zinc-300 truncate group-hover/note:text-primary">{note.title || <span className="italic opacity-50">Untitled</span>}</p>
                    <p className="text-[7px] sm:text-[10px] text-slate-400 mt-0.5">{note.lastEdited}</p>
                  </div>
                ))}
                {folderNotes.length > 3 && (
                  <div className="w-full text-center text-[9px] sm:text-[11px] font-bold text-primary mt-1.5 group-hover:underline">
                    +{folderNotes.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}

          {isCreating ? (
            <div className="bg-white dark:bg-zinc-800 rounded-2xl sm:rounded-[32px] p-4 sm:p-8 border-2 border-primary shadow-xl animate-in zoom-in-95 duration-200">
               <h3 className="text-[10px] sm:text-sm font-bold mb-2 sm:mb-4 dark:text-white">New folder name</h3>
               <form onSubmit={handleCreateSubmit} className="space-y-2 sm:space-y-4">
                  <input 
                    autoFocus
                    type="text" 
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="e.g. Work, Ideas..."
                    className="w-full bg-slate-50 dark:bg-zinc-700 border-none rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-sm focus:ring-2 focus:ring-primary dark:text-white"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setIsCreating(false)} className="flex-1 py-1.5 text-[9px] sm:text-xs font-bold text-slate-400">Cancel</button>
                    <button type="submit" className="flex-1 py-1.5 bg-primary text-primary-text text-[9px] sm:text-xs font-bold rounded-lg sm:rounded-xl shadow-lg">Create</button>
                  </div>
               </form>
            </div>
          ) : (
            <button 
              onClick={() => setIsCreating(true)}
              className="border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-2xl sm:rounded-[32px] p-4 sm:p-8 flex flex-col items-center justify-center gap-1.5 sm:gap-3 hover:bg-white dark:hover:bg-zinc-800/50 hover:border-primary transition-all group min-h-[120px] sm:min-h-[220px]"
            >
              <div className="size-8 sm:size-14 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-300 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                <span className="material-symbols-outlined text-[20px] sm:text-[32px]">create_new_folder</span>
              </div>
              <span className="text-[10px] sm:text-sm font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-zinc-200">Create Folder</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoldersView;
