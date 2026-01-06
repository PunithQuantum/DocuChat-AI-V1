
// Augment the existing NodeJS namespace to include API_KEY in ProcessEnv
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}

/**
 * Fix: Removed redundant 'declare var process' which caused a naming conflict.
 * The NodeJS.ProcessEnv interface augmentation above is sufficient for 
 * process.env type safety when Node.js types are present.
 */

declare module 'react-markdown' {
  import { FC, ReactNode } from 'react';
  interface ReactMarkdownProps {
    children: string;
    components?: Record<string, FC<any>>;
  }
  const ReactMarkdown: FC<ReactMarkdownProps>;
  export default ReactMarkdown;
}
