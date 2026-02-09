
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AppView, Note, ChatMessage, Template } from './types';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import AIChat from './components/AIChat';
import FoldersView from './components/FoldersView';
import SettingsView from './components/SettingsView';
import TemplateGallery from './components/TemplateGallery';
import { supabase } from './services/supabase';

const THEME_KEY = 'smart_ai_notes_theme';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [user, setUser] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem(THEME_KEY) === 'true');
  const [isLoading, setIsLoading] = useState(true);
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ ids: string[]; title: string } | null>(null);

  const [isSidebarVisible, setIsSidebarVisible] = useState(window.innerWidth > 1024);
  const [isNoteListVisible, setIsNoteListVisible] = useState(window.innerWidth > 768);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [noteListWidth, setNoteListWidth] = useState(380);
  const [isResizing, setIsResizing] = useState<null | 'sidebar' | 'notelist'>(null);
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const sidebarWidthRef = useRef(256);
  const noteListWidthRef = useRef(380);
  const isSidebarVisibleRef = useRef(window.innerWidth > 1024);

  useEffect(() => {
    sidebarWidthRef.current = sidebarWidth;
    noteListWidthRef.current = noteListWidth;
    isSidebarVisibleRef.current = isSidebarVisible;
  }, [sidebarWidth, noteListWidth, isSidebarVisible]);

  const [notes, setNotes] = useState<Note[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarVisible(false);
        if (activeNoteId || view === AppView.AI_ASSISTANT || view === AppView.SETTINGS || view === AppView.FOLDERS) {
          setIsNoteListVisible(false);
        } else {
          setIsNoteListVisible(true);
        }
      } else {
        setIsSidebarVisible(window.innerWidth > 1024);
        setIsNoteListVisible(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, [activeNoteId, view]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) setView(AppView.ALL_NOTES);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setView(AppView.ALL_NOTES);
      } else {
        setView(AppView.LOGIN);
        setNotes([]);
        setChatHistory([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setIsLoading(true);
      const { data: notesData } = await supabase.from('notes').select('*').order('last_edited', { ascending: false });
      if (notesData) {
        setNotes(notesData.map((n: any) => ({
          id: n.id, title: n.title, content: n.content,
          lastEdited: new Date(n.last_edited).toLocaleString(),
          isFavorite: n.is_favorite, folder: n.folder, tags: n.tags || []
        })));
      }
      const { data: chatData } = await supabase.from('chat_messages').select('*').order('timestamp', { ascending: true });
      if (chatData) {
        setChatHistory(chatData.map((c: any) => ({
          id: c.id, role: c.role, content: c.content,
          timestamp: new Date(c.timestamp).toLocaleString(),
          references: c.references || []
        })));
      }
      setIsLoading(false);
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, String(isDarkMode));
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (!isResizing || isMobile) return;
    
    document.body.classList.add('resizing');
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing === 'sidebar') {
        const newWidth = Math.min(Math.max(180, e.clientX), 480);
        setSidebarWidth(newWidth);
      } else if (isResizing === 'notelist') {
        const offset = isSidebarVisibleRef.current ? sidebarWidthRef.current : 0;
        const newWidth = Math.min(Math.max(220, e.clientX - (offset + 1)), 600);
        setNoteListWidth(newWidth);
      }
    };
    
    const handleMouseUp = () => {
      document.body.classList.remove('resizing');
      setIsResizing(null);
    };
    
    document.addEventListener('mousemove', handleMouseMove, { capture: false, passive: false });
    document.addEventListener('mouseup', handleMouseUp, { capture: false });
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove, false);
      document.removeEventListener('mouseup', handleMouseUp, false);
      document.body.classList.remove('resizing');
    };
  }, [isResizing, isMobile]);

  const filteredNotes = useMemo(() => {
    let list = notes;
    if (view === AppView.FAVORITES) list = list.filter(n => n.isFavorite);
    if (selectedFolder) list = list.filter(n => n.folder === selectedFolder);
    if (searchQuery) {
      list = list.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list;
  }, [notes, view, searchQuery, selectedFolder]);

  const activeNote = useMemo(() => notes.find(n => n.id === activeNoteId) || null, [notes, activeNoteId]);

  const handleCreateNote = async (folder: string = 'General') => {
    if (!user) return;
    const { data, error } = await supabase.from('notes').insert([{
      user_id: user.id, title: '', content: '', last_edited: new Date().toISOString(), is_favorite: false, folder, tags: []
    }]).select().single();
    if (!error && data) {
      const newNote = { id: data.id, title: data.title, content: data.content, lastEdited: 'Just now', isFavorite: data.is_favorite, folder: data.folder, tags: data.tags };
      setNotes(prev => [newNote, ...prev]);
      setActiveNoteId(newNote.id);
      setSelectedFolder(folder);
      setView(AppView.ALL_NOTES);
      if (isMobile) setIsNoteListVisible(false);
    }
  };

  const handleCreateFromTemplate = async (template: Template) => {
    if (!user) return;
    const { data, error } = await supabase.from('notes').insert([{
      user_id: user.id, title: template.defaultTitle, content: template.defaultContent, last_edited: new Date().toISOString(), is_favorite: false, folder: template.defaultFolder, tags: [template.name]
    }]).select().single();
    if (!error && data) {
      const newNote = { id: data.id, title: data.title, content: data.content, lastEdited: 'Just now', isFavorite: data.is_favorite, folder: data.folder, tags: data.tags };
      setNotes(prev => [newNote, ...prev]);
      setActiveNoteId(newNote.id);
      setSelectedFolder(newNote.folder);
      setView(AppView.ALL_NOTES);
      setIsTemplateGalleryOpen(false);
      if (isMobile) setIsNoteListVisible(false);
      setToast({ message: `Template "${template.name}" applied`, type: 'success' });
    }
  };

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;
    if (updates.folder !== undefined) dbUpdates.folder = updates.folder;
    dbUpdates.last_edited = new Date().toISOString();
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, lastEdited: 'Just now' } : n));
    await supabase.from('notes').update(dbUpdates).eq('id', id);
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    const { ids } = confirmDelete;
    setConfirmDelete(null);
    const { error } = await supabase.from('notes').delete().in('id', ids);
    if (!error) {
      setNotes(prev => prev.filter(n => !ids.includes(n.id)));
      setSelectedNoteIds([]);
      if (activeNoteId && ids.includes(activeNoteId)) {
        setActiveNoteId(null);
        if (isMobile) setIsNoteListVisible(true);
      }
      setToast({ message: 'Deleted.', type: 'success' });
    }
  };

  const handleUpdateChatHistory = async (newHistory: ChatMessage[]) => {
    setChatHistory(newHistory);
    const lastMsg = newHistory[newHistory.length - 1];
    if (user && lastMsg) {
      await supabase.from('chat_messages').insert([{
        user_id: user.id, role: lastMsg.role, content: lastMsg.content, timestamp: new Date().toISOString(), references: lastMsg.references || []
      }]);
    }
  };

  const handleMobileBack = () => {
    setView(AppView.ALL_NOTES);
    setIsNoteListVisible(true);
    setActiveNoteId(null);
  };

  const handleViewChange = (newView: AppView) => {
    setView(newView);
    if (isMobile && newView !== AppView.ALL_NOTES && newView !== AppView.FAVORITES) {
      setIsNoteListVisible(false);
    }
  };

  const handleFolderSelect = (folder: string | null) => {
    setSelectedFolder(folder);
    setView(AppView.ALL_NOTES);
    if (isMobile) setIsNoteListVisible(true);
  };

  const handleBackup = async () => {
    if (!user) return;
    const { data: notesData } = await supabase.from('notes').select('*').eq('user_id', user.id);
    const { data: chatData } = await supabase.from('chat_messages').select('*').eq('user_id', user.id);
    
    const backupData = {
      exportedAt: new Date().toISOString(),
      notes: notesData || [],
      chatHistory: chatData || []
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart-ai-notes-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setToast({ message: 'Backup downloaded successfully', type: 'success' });
  };

  if (isLoading && view === AppView.LOGIN) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
          <p className="text-[11px] font-bold text-slate-500">Syncing Cloud...</p>
        </div>
      </div>
    );
  }

  if (view === AppView.LOGIN || !user) return <Login onLogin={() => setView(AppView.ALL_NOTES)} />;

  const showNoteListCol = (view === AppView.ALL_NOTES || view === AppView.FAVORITES || view === AppView.AI_ASSISTANT);

  return (
    <div className="flex h-screen w-full bg-white dark:bg-background-dark overflow-hidden transition-colors">
      {confirmDelete && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xs bg-white dark:bg-zinc-900 rounded-3xl p-6 text-center border shadow-2xl">
            <h3 className="text-lg font-bold dark:text-white mb-2">Delete Permanently?</h3>
            <p className="text-xs text-slate-500 mb-6 italic">"{confirmDelete.title}"</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">Cancel</button>
              <button onClick={executeDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-500 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {isMobile && isSidebarVisible && (
        <div className="fixed inset-0 z-[150] bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsSidebarVisible(false)} />
      )}

      <div className={`${isMobile ? 'fixed inset-y-0 left-0 z-[160]' : 'relative'} transition-all`} style={{ width: isSidebarVisible ? `${isMobile ? 260 : sidebarWidth}px` : '0px' }}>
        <Sidebar currentView={view} onViewChange={handleViewChange} onNewNote={() => handleCreateNote()} onOpenTemplates={() => setIsTemplateGalleryOpen(true)} onHide={() => setIsSidebarVisible(false)} width={isMobile ? 260 : sidebarWidth} />
      </div>

      {!isMobile && isSidebarVisible && (
        <div className="w-px bg-slate-200 dark:bg-zinc-700 cursor-col-resize z-50" onMouseDown={() => setIsResizing('sidebar')} />
      )}

      <div className="flex-1 flex min-w-0">
        {showNoteListCol && (
          <div className={`${isMobile ? (isNoteListVisible ? 'fixed inset-0 z-[100]' : 'hidden') : 'relative'} transition-all`} style={{ width: isMobile ? '100%' : (isNoteListVisible ? `${noteListWidth}px` : '0px') }}>
            <NoteList 
              notes={filteredNotes} activeNoteId={activeNoteId} selectedIds={selectedNoteIds} onSelectionChange={setSelectedNoteIds}
              onNoteSelect={(id) => { setActiveNoteId(id); if (isMobile) setIsNoteListVisible(false); }}
              onDeleteSelected={(ids) => setConfirmDelete({ ids, title: ids.length === 1 ? 'This note' : 'Multiple notes' })}
              onSearch={setSearchQuery} onHide={() => setIsNoteListVisible(false)} width={isMobile ? window.innerWidth : noteListWidth}
              selectedFolder={selectedFolder} onClearFolder={() => setSelectedFolder(null)} onShowSidebar={() => setIsSidebarVisible(true)} isMobile={isMobile}
            />
          </div>
        )}

        {!isMobile && showNoteListCol && isNoteListVisible && (
          <div className="w-px bg-slate-200 dark:bg-zinc-700 cursor-col-resize z-50" onMouseDown={() => setIsResizing('notelist')} />
        )}

        <div className={`flex-1 flex flex-col bg-white dark:bg-background-dark overflow-hidden relative ${isMobile && isNoteListVisible && showNoteListCol ? 'hidden' : 'flex'}`}>
          {view === AppView.AI_ASSISTANT ? (
            <div className="flex-1 flex min-w-0 overflow-hidden">
              <AIChat notes={notes} history={chatHistory} onHistoryUpdate={handleUpdateChatHistory} isSidebarVisible={isSidebarVisible} onShowSidebar={() => setIsSidebarVisible(true)} isMobile={isMobile} onBack={handleMobileBack} />
            </div>
          ) : view === AppView.FOLDERS ? (
            <FoldersView notes={notes} onNoteSelect={(id) => { setActiveNoteId(id); setView(AppView.ALL_NOTES); if(isMobile) setIsNoteListVisible(false); }} onFolderSelect={handleFolderSelect} onFolderCreate={handleCreateNote} onShowSidebar={() => setIsSidebarVisible(true)} sidebarHidden={!isSidebarVisible} isMobile={isMobile} onBack={handleMobileBack} />
          ) : view === AppView.SETTINGS ? (
            <SettingsView isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} onResetData={() => {}} onBackup={handleBackup} onLogout={() => supabase.auth.signOut()} notesCount={notes.length} onShowSidebar={() => setIsSidebarVisible(true)} sidebarHidden={!isSidebarVisible} isMobile={isMobile} onBack={handleMobileBack} />
          ) : activeNote ? (
            <NoteEditor key={activeNote.id} note={activeNote} onUpdate={handleUpdateNote} onShowSidebar={() => setIsSidebarVisible(true)} sidebarHidden={!isSidebarVisible} onShowNoteList={() => setIsNoteListVisible(true)} noteListHidden={!isNoteListVisible && showNoteListCol} isMobile={isMobile} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-zinc-900">
              <div className="relative mb-6">
                <div className="size-24 sm:size-48 bg-slate-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-[48px] sm:text-[80px] text-primary/30">edit_note</span>
                </div>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold mb-4 dark:text-white">Workspace Ready.</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => handleCreateNote()} className="px-6 py-3 bg-primary font-bold rounded-xl text-xs sm:text-sm">Blank Note</button>
                <button onClick={() => setIsTemplateGalleryOpen(true)} className="px-6 py-3 border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-xl text-xs sm:text-sm dark:text-white hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors">Templates</button>
              </div>
            </div>
          )}

          {toast && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-bold z-[700] animate-in slide-in-from-bottom-2">
              {toast.message}
            </div>
          )}
        </div>
      </div>

      <TemplateGallery isOpen={isTemplateGalleryOpen} onClose={() => setIsTemplateGalleryOpen(false)} onSelect={handleCreateFromTemplate} />
    </div>
  );
};

export default App;
