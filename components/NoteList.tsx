
import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';

interface NoteListProps {
  notes: Note[];
  activeNoteId: string | null;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onNoteSelect: (id: string) => void;
  onDeleteSelected: (ids: string[]) => void;
  onSearch: (query: string) => void;
  onHide: () => void;
  width: number;
  selectedFolder?: string | null;
  onClearFolder?: () => void;
  onShowSidebar?: () => void;
  isMobile?: boolean;
}

const NoteList: React.FC<NoteListProps> = ({ 
  notes, 
  activeNoteId, 
  selectedIds, 
  onSelectionChange, 
  onNoteSelect, 
  onDeleteSelected, 
  onSearch, 
  onHide, 
  width,
  selectedFolder,
  onClearFolder,
  onShowSidebar,
  isMobile
}) => {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleBulkDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSelected(selectedIds);
  };

  const handleIndividualDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteSelected([id]);
    setMenuOpenId(null);
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setMenuOpenId(menuOpenId === id ? null : id);
  };

  return (
    <div 
      className="border-r border-slate-100 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-900 h-full shrink-0 overflow-hidden relative"
      style={{ width: isMobile ? '100%' : `${width}px` }}
    >
      <div className="p-3 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex flex-col gap-2 sm:gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            {isMobile && (
              <button 
                onClick={onShowSidebar}
                className="p-1 -ml-1 text-slate-400 hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">menu</span>
              </button>
            )}
            <h2 className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 truncate">
              {selectedIds.length > 0 ? `${selectedIds.length} Selected` : (selectedFolder || 'Workspace')}
            </h2>
            {selectedFolder && selectedIds.length === 0 && (
              <button 
                onClick={onClearFolder}
                className="text-primary hover:text-primary-hover transition-colors"
              >
                <span className="material-symbols-outlined text-[12px] sm:text-[14px]">cancel</span>
              </button>
            )}
          </div>
          {!isMobile && (
            <button 
              onClick={onHide}
              className="p-1 text-slate-300 hover:text-slate-500 dark:hover:text-zinc-400 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_left</span>
            </button>
          )}
        </div>
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-600 group-focus-within:text-yellow-600 transition-colors text-[16px] sm:text-[20px]">search</span>
          <input 
            type="text" 
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-zinc-800 border-none rounded-lg sm:rounded-xl pl-8 sm:pl-10 pr-3 py-1.5 sm:py-2.5 text-[11px] sm:text-sm focus:ring-2 focus:ring-primary/50 placeholder:text-slate-400 dark:placeholder:text-zinc-600 dark:text-white transition-all" 
            placeholder="Search notes..." 
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {notes.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-[10px] sm:text-xs">
            No notes found.
          </div>
        ) : (
          notes.map(note => (
            <div 
              key={note.id}
              onClick={() => onNoteSelect(note.id)}
              className={`p-3 sm:p-5 border-b border-slate-50 dark:border-zinc-800 cursor-pointer transition-all group relative flex items-start gap-2.5 sm:gap-4 ${activeNoteId === note.id && !isMobile ? 'bg-yellow-50/50 dark:bg-yellow-900/5 border-l-[3px] border-l-primary' : 'hover:bg-slate-50/50 dark:hover:bg-zinc-800/50'}`}
            >
              <div 
                onClick={(e) => toggleSelect(e, note.id)}
                className={`shrink-0 size-3.5 sm:size-5 mt-0.5 rounded sm:rounded-md border-2 transition-all flex items-center justify-center ${selectedIds.includes(note.id) ? 'bg-primary border-primary text-primary-text' : 'border-slate-200 dark:border-zinc-700 group-hover:border-primary/50'}`}
              >
                {selectedIds.includes(note.id) && (
                  <span className="material-symbols-outlined text-[10px] sm:text-[14px] font-bold">check</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5 sm:mb-1">
                  <h3 className={`text-xs sm:text-sm font-bold truncate pr-4 ${activeNoteId === note.id && !isMobile ? 'text-yellow-800 dark:text-yellow-500' : 'text-slate-900 dark:text-zinc-200'}`}>{note.title || <span className="italic opacity-50">Untitled</span>}</h3>
                  <div className="relative">
                    <button 
                      onClick={(e) => toggleMenu(e, note.id)}
                      className="p-0.5 text-slate-300 hover:text-primary transition-colors rounded-md"
                    >
                      <span className="material-symbols-outlined text-[14px] sm:text-[18px]">more_horiz</span>
                    </button>
                    
                    {menuOpenId === note.id && (
                      <div 
                        ref={menuRef}
                        className="absolute right-0 top-full mt-1 w-32 sm:w-44 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-lg sm:rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
                      >
                        <button 
                          onClick={(e) => handleIndividualDelete(e, note.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 sm:py-3 text-[10px] sm:text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px] sm:text-[18px]">delete</span>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                  {note.content || <span className="italic opacity-50 text-[9px] sm:text-[11px]">Empty note...</span>}
                </p>
                <div className="flex items-center justify-between mt-1.5 sm:mt-3">
                   <div className="flex gap-1 sm:gap-2 overflow-hidden">
                    {note.folder && (
                      <span className="px-1 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 text-[7px] sm:text-[9px] font-bold rounded uppercase tracking-wider">{note.folder}</span>
                    )}
                  </div>
                  <span className="text-[7px] sm:text-[9px] text-slate-400 dark:text-zinc-500 whitespace-nowrap font-medium">{note.lastEdited}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[92%] bg-slate-900 text-white rounded-xl sm:rounded-[24px] shadow-2xl p-2.5 sm:p-4 flex items-center justify-between animate-in slide-in-from-bottom-6 duration-300 z-50">
          <div className="flex items-center gap-1.5 sm:gap-3 ml-1 sm:ml-2">
            <div className="size-6 sm:size-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-[9px] sm:text-xs text-primary">
              {selectedIds.length}
            </div>
            <span className="text-[8px] sm:text-[11px] font-bold tracking-wide">Selected</span>
          </div>
          <div className="flex items-center gap-1">
             <button 
              onClick={() => onSelectionChange([])}
              className="px-2 py-1.5 text-[8px] sm:text-[10px] font-bold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleBulkDelete}
              className="px-3 py-1.5 sm:py-2.5 bg-red-600 hover:bg-red-500 text-white text-[8px] sm:text-[10px] font-bold rounded-lg sm:rounded-xl transition-all shadow-lg flex items-center gap-1 sm:gap-2"
            >
              <span className="material-symbols-outlined text-[14px] sm:text-[18px]">delete</span>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteList;
