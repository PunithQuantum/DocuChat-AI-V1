
interface ImportMetaEnv {
  readonly API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Augment the existing NodeJS namespace to include API_KEY in process.env
// This avoids "Subsequent variable declarations" and "Cannot redeclare" errors by 
// extending the existing Process types instead of trying to override the variable declaration.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}

declare module 'react-markdown' {
  import { FC, ReactNode } from 'react';
  interface ReactMarkdownProps {
    children: string;
    components?: Record<string, FC<any>>;
  }
  const ReactMarkdown: FC<ReactMarkdownProps>;
  export default ReactMarkdown;
}
