
export interface Note {
  id: string;
  title: string;
  content: string;
  lastEdited: string;
  isFavorite: boolean;
  folder: string;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  references?: string[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  defaultTitle: string;
  defaultContent: string;
  defaultFolder: string;
  color: string;
}

export enum AppView {
  LOGIN = 'LOGIN',
  ALL_NOTES = 'ALL_NOTES',
  FAVORITES = 'FAVORITES',
  FOLDERS = 'FOLDERS',
  AI_ASSISTANT = 'AI_ASSISTANT',
  SETTINGS = 'SETTINGS'
}
