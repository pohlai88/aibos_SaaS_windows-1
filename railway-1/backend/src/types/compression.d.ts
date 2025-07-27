declare module 'compression' {
  import { RequestHandler } from 'express';

  interface CompressionOptions {
    filter?: (req: any, res: any) => boolean;
    threshold?: number;
    level?: number;
    memLevel?: number;
    windowBits?: number;
    strategy?: number;
    chunkSize?: number;
  }

  function compression(options?: CompressionOptions): RequestHandler;

  export = compression;
}
