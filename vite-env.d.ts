
/// <reference types="vite/client" />

/**
 * Augment the NodeJS namespace to include API_KEY in ProcessEnv.
 * This avoids conflicting with existing global 'process' declarations
 * by extending the existing types instead of attempting to redeclare them.
 */
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}

declare module 'react-markdown' {
  import { FC } from 'react';
  const ReactMarkdown: FC<any>;
  export default ReactMarkdown;
}

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
