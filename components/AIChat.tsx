
import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Note, ChatMessage } from '../types';
import { askAssistant } from '../services/gemini';
import { cn } from '../lib/utils';
import { AnimatedGridPattern } from './ui/animated-grid-pattern';

interface AIChatProps {
  notes: Note[];
  history: ChatMessage[];
  onHistoryUpdate: (history: ChatMessage[]) => void;
  isSidebarVisible: boolean;
  onShowSidebar: () => void;
  isMobile?: boolean;
  onBack?: () => void;
}

const AIChat: React.FC<AIChatProps> = ({ notes, history, onHistoryUpdate, isSidebarVisible, onShowSidebar, isMobile, onBack }) => {
  const [inputValue, setInputValue] = useState('');
  const [contextSearch, setContextSearch] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isTyping]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: 'Just now'
    };

    const newHistory = [...history, userMessage];
    onHistoryUpdate(newHistory);
    setInputValue('');
    setIsTyping(true);

    try {
      const { text, references } = await askAssistant(inputValue, notes, newHistory);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: 'Just now',
        references
      };
      onHistoryUpdate([...newHistory, assistantMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const filteredContextNotes = useMemo(() => {
    if (!contextSearch) return notes;
    return notes.filter(n => 
      n.title.toLowerCase().includes(contextSearch.toLowerCase()) || 
      n.content.toLowerCase().includes(contextSearch.toLowerCase())
    );
  }, [notes, contextSearch]);

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark relative h-full">
        <header className="h-12 sm:h-16 px-3 sm:px-6 flex items-center justify-between bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-2 sm:gap-3">
            {(isMobile || !isSidebarVisible) && (
              <button onClick={isMobile ? onBack : onShowSidebar} className="p-1 -ml-1 text-slate-400">
                <span className="material-symbols-outlined text-[20px]">{isMobile ? 'arrow_back' : 'menu'}</span>
              </button>
            )}
            <div className="size-6 sm:size-8 rounded-full bg-primary-soft dark:bg-yellow-900/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[16px] sm:text-[20px]">auto_awesome</span>
            </div>
            <div>
              <h2 className="text-[12px] sm:text-sm font-bold dark:text-white truncate">AI Assistant</h2>
              <div className="flex items-center gap-1">
                <span className="size-1 rounded-full bg-emerald-500"></span>
                <span className="text-[9px] sm:text-[11px] text-slate-500">Syncing Workspace</span>
              </div>
            </div>
          </div>
          <button onClick={() => setShowContext(!showContext)} className={`p-1.5 rounded-lg ${showContext ? 'text-primary bg-primary/10' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined text-[18px]">data_usage</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-3 sm:p-8 space-y-4 sm:space-y-10 no-scrollbar relative" ref={scrollRef}>
          <AnimatedGridPattern numSquares={isMobile ? 10 : 30} maxOpacity={0.03} duration={3} className="absolute inset-0 h-full w-full" />
          <div className="relative z-10 space-y-4 sm:space-y-10">
            {history.map((msg) => (
              <div key={msg.id} className={`flex gap-2 sm:gap-4 max-w-4xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`size-6 sm:size-8 rounded sm:rounded-lg shrink-0 flex items-center justify-center text-[14px] sm:text-[18px] ${msg.role === 'assistant' ? 'bg-primary-soft text-primary' : 'bg-slate-200 dark:bg-zinc-700 text-slate-500'}`}>
                  <span className="material-symbols-outlined text-[inherit]">{msg.role === 'assistant' ? 'psychology' : 'person'}</span>
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className={`px-3 sm:px-5 py-2 sm:py-4 rounded-xl sm:rounded-2xl text-[11px] sm:text-sm leading-relaxed ${msg.role === 'assistant' ? 'bg-white dark:bg-zinc-800 border border-slate-100 dark:border-zinc-800 shadow-sm dark:text-zinc-300' : 'bg-primary-soft text-yellow-900 dark:bg-yellow-900/30 dark:text-yellow-100'} ${msg.role === 'assistant' ? 'rounded-tl-none' : 'rounded-tr-none'}`}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h3: ({node, ...props}) => <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-4 mb-2 first:mt-0" {...props} />,
                            h4: ({node, ...props}) => <h4 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-200 mt-3 mb-1.5" {...props} />,
                            p: ({node, ...props}) => <p className="text-[10px] sm:text-xs text-slate-700 dark:text-zinc-400 mb-2 leading-relaxed" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside text-[10px] sm:text-xs text-slate-700 dark:text-zinc-400 space-y-1 ml-2" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal list-inside text-[10px] sm:text-xs text-slate-700 dark:text-zinc-400 space-y-1 ml-2" {...props} />,
                            li: ({node, ...props}) => <li className="text-[10px] sm:text-xs text-slate-700 dark:text-zinc-400" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
                            code: ({node, ...props}) => <code className="bg-slate-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono text-slate-800 dark:text-zinc-300" {...props} />,
                            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-3 italic text-slate-600 dark:text-zinc-500 my-2 text-[10px] sm:text-xs" {...props} />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    )}
                  </div>
                  <span className={`text-[8px] sm:text-[10px] text-slate-400 ${msg.role === 'user' ? 'text-right' : ''}`}>{msg.timestamp}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2 sm:gap-4 max-w-4xl">
                <div className="size-6 sm:size-8 rounded-lg bg-primary-soft shrink-0 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[14px] sm:text-[18px]">psychology</span>
                </div>
                <div className="bg-white dark:bg-zinc-800 px-2 py-1.5 rounded-xl border shadow-sm flex items-center gap-1">
                  <div className="size-1 bg-primary rounded-full animate-bounce"></div>
                  <div className="size-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-8 pt-0 z-20 bg-slate-50/80 dark:bg-zinc-900/80 backdrop-blur-sm shrink-0 sticky bottom-0">
          <form className="max-w-4xl mx-auto relative" onSubmit={handleSubmit}>
            <input 
              type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-yellow-200 dark:border-zinc-700 rounded-xl pl-4 pr-10 py-2.5 sm:py-4 text-slate-900 dark:text-white text-[11px] sm:text-sm focus:ring-4 focus:ring-yellow-200 dark:focus:ring-primary/10 transition-all outline-none shadow-sm placeholder-slate-500 dark:placeholder-slate-400"
              placeholder="Ask Workspace Assistant..."
            />
            <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 size-7 sm:size-10 bg-primary text-primary-text rounded-lg flex items-center justify-center active:scale-90">
              <span className="material-symbols-outlined text-[16px] sm:text-[24px]">send</span>
            </button>
          </form>
        </div>
      </div>

      {(showContext || !isMobile) && showContext && (
        <aside className={`${isMobile ? 'fixed inset-y-0 right-0 z-50 w-64 animate-in slide-in-from-right duration-300' : 'w-72'} border-l border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0`}>
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workspace Context</h3>
            {isMobile && <button onClick={() => setShowContext(false)} className="material-symbols-outlined text-[18px]">close</button>}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
            {filteredContextNotes.map(n => (
              <div key={n.id} className="p-2.5 bg-slate-50 dark:bg-zinc-800 border rounded-lg">
                <h4 className="text-[10px] font-bold dark:text-white mb-1 truncate">{n.title || 'Untitled'}</h4>
                <p className="text-[9px] text-slate-500 dark:text-zinc-400 line-clamp-2 leading-tight">{n.content}</p>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
};

export default AIChat;
