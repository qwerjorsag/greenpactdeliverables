/// <reference types="vite/client" />

type RuntimeConfig = {
  apiBaseUrl?: string;
};

declare global {
  interface Window {
    __GREENPACT_CONFIG__?: RuntimeConfig;
  }
}

declare module '*.png';
declare module '*.svg';
declare module '*.ttf';
declare module '*.ttf?url';
