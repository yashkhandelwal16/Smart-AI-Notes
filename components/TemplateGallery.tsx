
import React from 'react';
import { Template } from '../types';

interface TemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

const TEMPLATES: Template[] = [
  {
    id: 'meeting-minutes',
    name: 'Meeting Minutes',
    description: 'Track dates, attendees, and action items effortlessly.',
    icon: 'groups',
    color: 'bg-blue-500',
    defaultFolder: 'Meetings',
    defaultTitle: 'Meeting: [Topic Name]',
    defaultContent: `### 📅 Date & Time\n- ${new Date().toLocaleDateString()} at \n\n### 👥 Attendees\n- \n\n### 📋 Agenda\n1. \n\n### 📝 Notes\n- \n\n### ✅ Action Items\n- [ ] `
  },
  {
    id: 'project-brief',
    name: 'Project Brief',
    description: 'Structure objectives, stakeholders, and goals.',
    icon: 'rocket_launch',
    color: 'bg-purple-500',
    defaultFolder: 'Projects',
    defaultTitle: 'Project Brief: [Project Name]',
    defaultContent: `### 🚀 Overview\nBrief description.\n\n### 🎯 Objectives\n- \n\n### 👥 Stakeholders\n- \n\n### 🗺️ Timeline\n- Phase 1: \n- Phase 2: \n\n### 🛠️ Key Requirements\n- `
  },
  {
    id: 'daily-reflection',
    name: 'Daily Reflection',
    description: 'Note down wins, gratitude, and future goals.',
    icon: 'self_improvement',
    color: 'bg-amber-500',
    defaultFolder: 'Personal',
    defaultTitle: `Reflection: ${new Date().toLocaleDateString()}`,
    defaultContent: `### 🌟 Gratitude\n3 things:\n1. \n2. \n3. \n\n### 🏆 Today's Wins\n- \n\n### 🧠 Learning & Growth\n- \n\n### 🎯 Tomorrow's Goals\n- [ ] `
  },
  {
    id: 'class-notes',
    name: 'Study Notes',
    description: 'Structured layout for lectures and concepts.',
    icon: 'school',
    color: 'bg-emerald-500',
    defaultFolder: 'Learning',
    defaultTitle: 'Lecture: [Topic]',
    defaultContent: `### 📚 Course Information\n- Course: \n- Instructor: \n\n### 💡 Key Concepts\n- \n\n### 📖 Content Details\n- \n\n### 📝 Summary\nKey takeaways?`
  }
];

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-12 animate-in fade-in duration-300">
      <div 
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-[32px] shadow-2xl border border-white/20 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
        <header className="p-4 sm:p-8 pb-2 sm:pb-4 flex items-center justify-between shrink-0 bg-white/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h2 className="text-base sm:text-2xl font-extrabold dark:text-white">Note Templates</h2>
            <p className="text-[10px] sm:text-sm text-slate-500 dark:text-zinc-500 font-medium">Start your creativity instantly.</p>
          </div>
          <button 
            onClick={onClose}
            className="size-8 sm:size-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[24px]">close</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 pt-3 sm:pt-6 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
            {TEMPLATES.map((template) => (
              <div 
                key={template.id}
                onClick={() => onSelect(template)}
                className="group relative flex flex-col gap-2 sm:gap-4 p-3.5 sm:p-6 rounded-xl sm:rounded-[24px] border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 hover:bg-white dark:hover:bg-zinc-800 hover:border-primary transition-all cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <div className="flex items-start justify-between">
                  <div className={`size-8 sm:size-12 rounded-lg sm:rounded-xl ${template.color} text-white flex items-center justify-center shadow-md`}>
                    <span className="material-symbols-outlined text-[18px] sm:text-[28px]">{template.icon}</span>
                  </div>
                  <span className="text-[7px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded-md border border-slate-100 dark:border-zinc-700">
                    Structure
                  </span>
                </div>
                
                <div className="overflow-hidden">
                  <h3 className="text-[13px] sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">{template.name}</h3>
                  <p className="text-[9px] sm:text-xs text-slate-500 dark:text-zinc-400 leading-relaxed mt-0.5 line-clamp-2">
                    {template.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="p-4 sm:p-8 pt-2 sm:pt-4 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/30 flex justify-end">
          <button 
            onClick={() => onSelect({
              id: 'blank',
              name: 'Blank Note',
              description: 'Empty canvas.',
              icon: 'description',
              color: 'bg-slate-400',
              defaultFolder: 'General',
              defaultTitle: '',
              defaultContent: '',
            })}
            className="px-4 py-1.5 text-[10px] sm:text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            Create Blank
          </button>
        </footer>
      </div>
    </div>
  );
};

export default TemplateGallery;
