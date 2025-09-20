// TypeScript declarations for Puter.js
declare global {
  interface Window {
    puter: {
      ai: {
        chat: (prompt: string, options?: { model?: string }) => Promise<{
          message: {
            content: string | Array<{ text: string }>;
          };
        }>;
      };
      print: (content: any) => void;
    };
  }
}

// Make puter available globally
declare const puter: {
  ai: {
    chat: (prompt: string, options?: { model?: string }) => Promise<{
      message: {
        content: string | Array<{ text: string }>;
      };
    }>;
  };
  print: (content: any) => void;
};

export {};