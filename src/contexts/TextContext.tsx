import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TextEntry } from '../db/database';

interface TextContextType {
  selectedText: TextEntry | null;
  setSelectedText: (text: TextEntry | null) => void;
}

const TextContext = createContext<TextContextType | undefined>(undefined);

interface TextProviderProps {
  children: ReactNode;
}

export const TextProvider: React.FC<TextProviderProps> = ({ children }) => {
  const [selectedText, setSelectedText] = useState<TextEntry | null>(null);

  return (
    <TextContext.Provider value={{ selectedText, setSelectedText }}>
      {children}
    </TextContext.Provider>
  );
};

export const useText = (): TextContextType => {
  const context = useContext(TextContext);
  if (context === undefined) {
    throw new Error('useText must be used within a TextProvider');
  }
  return context;
};