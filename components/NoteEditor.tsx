
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Note } from '../types';
import { GoogleGenAI } from "@google/genai";

interface NoteEditorProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onShowSidebar: () => void;
  sidebarHidden: boolean;
  onShowNoteList: () => void;
  noteListHidden: boolean;
  isMobile: boolean;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ 
  note, 
  onUpdate, 
  onShowSidebar, 
  sidebarHidden,
  onShowNoteList,
  noteListHidden,
  isMobile
}) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onUpdate(note.id, { title: newTitle });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onUpdate(note.id, { content: newContent });
  };

  const toggleFavorite = () => {
    onUpdate(note.id, { isFavorite: !note.isFavorite });
  };

  const shareToWhatsApp = () => {
    const text = `*${title || 'Untitled Note'}*\n\n${content}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowShareMenu(false);
  };

  const copyToClipboard = async () => {
    const text = `${title || 'Untitled Note'}\n\n${content}`;
    await navigator.clipboard.writeText(text);
    setShowCopyFeedback(true);
    setShowShareMenu(false);
    setTimeout(() => setShowCopyFeedback(false), 2000);
  };

  const handleSystemShare = async () => {
    const shareData = {
      title: title || 'Untitled Note',
      text: content,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        copyToClipboard();
      }
    } catch (err) {
      console.error('Sharing failed:', err);
    }
    setShowShareMenu(false);
  };

  const handleMagicAI = async (task: 'summarize' | 'polish') => {
    if (!content.trim() || isProcessing) return;
    setIsProcessing(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const systemInstructions = {
        summarize: `Act as a top-tier executive editor. 
          Create a structured summary of the note below. 
          Use Markdown headers (###), bold key phrases, and organize information into clear thematic blocks. 
          Ensure the output looks professional and "well-maintained".`,
        polish: `Act as a professional copywriter. 
          Rewrite the content below to be more sophisticated, clear, and impactful. 
          Use professional Markdown formatting. 
          Return ONLY the polished content with no conversational filler.`
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `CONTENT:\n${content}`,
        config: { 
          systemInstruction: systemInstructions[task],
          temperature: 0.7 
        }
      });

      const result = response.text || "";
      if (result) {
        const header = task === 'summarize' ? "Executive Summary" : "Polished Version";
        const updatedContent = `${content}\n\n---\n\n> ### AI ${header}\n\n${result}`;
        setContent(updatedContent);
        onUpdate(note.id, { content: updatedContent });
        setIsPreviewMode(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selectedText = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);

    const newContent = before + prefix + selectedText + suffix + after;
    setContent(newContent);
    onUpdate(note.id, { content: newContent });

    // Focus and restore selection
    setTimeout(() => {
      el.focus();
      const newCursorStart = start + prefix.length;
      const newCursorEnd = end + prefix.length;
      el.setSelectionRange(newCursorStart, newCursorEnd);
    }, 0);
  };

  const ToolbarButton = ({ icon, onClick, title }: { icon: string, onClick: () => void, title: string }) => (
    <button 
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className="p-1.5 sm:p-2 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors flex items-center justify-center shrink-0"
      title={title}
    >
      <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{icon}</span>
    </button>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-zinc-900 relative">
      <header className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 shrink-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-1 sm:gap-2">
          {isMobile ? (
            <button 
              onClick={onShowNoteList}
              className="p-2 -ml-2 text-slate-400 hover:text-primary transition-colors"
              title="Back to List"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          ) : (
            <>
              {sidebarHidden && (
                <button 
                  onClick={onShowSidebar}
                  className="p-2 text-slate-400 hover:text-primary transition-colors mr-1"
                  title="Show Sidebar"
                >
                  <span className="material-symbols-outlined">menu</span>
                </button>
              )}
              {noteListHidden && (
                <button 
                  onClick={onShowNoteList}
                  className="p-2 text-slate-400 hover:text-primary transition-colors mr-1"
                  title="Show Note List"
                >
                  <span className="material-symbols-outlined">view_sidebar</span>
                </button>
              )}
            </>
          )}
          
          <button 
            onClick={toggleFavorite}
            className={`p-2 rounded-lg transition-colors ${note.isFavorite ? 'text-primary' : 'text-slate-300 dark:text-zinc-600 hover:text-primary'}`}
          >
            <span className={`material-symbols-outlined ${note.isFavorite ? 'fill' : ''}`}>star</span>
          </button>
          
          <button 
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all ${isPreviewMode ? 'bg-primary/20 text-yellow-700 dark:text-primary border border-primary/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">{isPreviewMode ? 'edit' : 'visibility'}</span>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider hidden xs:inline">{isPreviewMode ? 'Editing' : 'Preview'}</span>
          </button>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center bg-slate-50 dark:bg-zinc-800 rounded-xl p-0.5 sm:p-1 gap-1 border border-slate-100 dark:border-zinc-700">
             <button 
              onClick={() => handleMagicAI('summarize')}
              disabled={isProcessing}
              className="px-2 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm rounded-lg transition-all disabled:opacity-50"
            >
              Summarize
            </button>
            <button 
              onClick={() => handleMagicAI('polish')}
              disabled={isProcessing}
              className="px-2 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-700 hover:shadow-sm rounded-lg transition-all disabled:opacity-50"
            >
              Polish
            </button>
          </div>

          <div className="relative" ref={shareMenuRef}>
            <button 
              onClick={() => setShowShareMenu(!showShareMenu)}
              disabled={isProcessing}
              className={`p-2 rounded-lg transition-all ${showShareMenu ? 'bg-yellow-100 text-yellow-600' : 'text-slate-400 dark:text-zinc-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'} disabled:opacity-30`}
            >
              <span className="material-symbols-outlined">share</span>
            </button>

            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="p-2 flex flex-col gap-1">
                  <button onClick={shareToWhatsApp} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl">
                    <div className="size-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shrink-0">
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                    </div>
                    WhatsApp
                  </button>
                  <button onClick={copyToClipboard} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-700 dark:text-zinc-200 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-xl">
                    <div className="size-8 rounded-lg bg-yellow-500 flex items-center justify-center text-white shrink-0">
                      <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </div>
                    Copy Note
                  </button>
                  <button onClick={handleSystemShare} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-xl">
                    <div className="size-8 rounded-lg bg-slate-400 flex items-center justify-center text-white shrink-0">
                      <span className="material-symbols-outlined text-[18px]">ios_share</span>
                    </div>
                    System Share
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Rich Text Toolbar */}
      {!isPreviewMode && (
        <div className="px-4 py-2 bg-slate-50/50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-0.5 sm:gap-1 overflow-x-auto no-scrollbar z-10 sticky top-16">
          <ToolbarButton icon="format_bold" onClick={() => insertMarkdown('**', '**')} title="Bold" />
          <ToolbarButton icon="format_italic" onClick={() => insertMarkdown('*', '*')} title="Italic" />
          <div className="w-px h-4 bg-slate-200 dark:bg-zinc-700 mx-1"></div>
          <ToolbarButton icon="title" onClick={() => insertMarkdown('### ')} title="Header" />
          <ToolbarButton icon="format_list_bulleted" onClick={() => insertMarkdown('- ')} title="Bullet List" />
          <ToolbarButton icon="format_list_numbered" onClick={() => insertMarkdown('1. ')} title="Numbered List" />
          <ToolbarButton icon="check_box" onClick={() => insertMarkdown('- [ ] ')} title="Task List" />
          <div className="w-px h-4 bg-slate-200 dark:bg-zinc-700 mx-1"></div>
          <ToolbarButton icon="code" onClick={() => insertMarkdown('`', '`')} title="Code" />
          <ToolbarButton icon="format_quote" onClick={() => insertMarkdown('> ')} title="Blockquote" />
          <ToolbarButton icon="horizontal_rule" onClick={() => insertMarkdown('\n---\n')} title="Horizontal Rule" />
          <ToolbarButton icon="link" onClick={() => insertMarkdown('[', '](url)')} title="Link" />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 sm:p-12 max-w-4xl mx-auto w-full no-scrollbar">
        {isPreviewMode ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-2xl sm:text-4xl font-extrabold mb-6 sm:mb-8 dark:text-white leading-tight">{title || 'Untitled Note'}</h1>
            <div className="prose dark:prose-invert prose-sm sm:prose-lg prose-slate dark:prose-zinc max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <>
            <input 
              type="text" 
              value={title}
              onChange={handleTitleChange}
              placeholder="Untitled Note"
              className="w-full text-2xl sm:text-4xl font-extrabold border-none focus:ring-0 placeholder:text-slate-200 dark:placeholder:text-zinc-800 p-0 mb-6 sm:mb-8 bg-transparent dark:text-white"
            />
            <textarea 
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              placeholder="Start writing..."
              className="w-full h-full text-base sm:text-lg leading-relaxed border-none focus:ring-0 placeholder:text-slate-300 dark:placeholder:text-zinc-800 p-0 resize-none min-h-[400px] bg-transparent dark:text-zinc-300"
            />
          </>
        )}
      </div>

      {isProcessing && (
        <div className="fixed inset-0 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-[1px] flex items-center justify-center z-[100]">
          <div className="flex flex-col items-center gap-4 bg-white dark:bg-zinc-800 p-8 sm:p-10 rounded-3xl shadow-2xl border border-yellow-100 dark:border-zinc-700 animate-in zoom-in-95 duration-200">
            <div className="relative">
               <div className="size-12 sm:size-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
               <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-primary text-[20px] sm:text-[24px]">auto_awesome</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-200">AI is working...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteEditor;
