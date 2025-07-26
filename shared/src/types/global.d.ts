// Global type declarations for cross-environment compatibility

declare global {
  // Node.js process global (only available in Node.js)
  var process: {
    env?: {
      NODE_ENV?: string;
      [key: string]: string | undefined;
    };
    versions?: {
      node?: string;
      [key: string]: string | undefined;
    };
  } | undefined;

  // Node.js Buffer global (only available in Node.js)
  var Buffer: {
    from(data: string | Buffer | ArrayBuffer | SharedArrayBuffer, encoding?: string): Buffer;
    alloc(size: number): Buffer;
    allocUnsafe(size: number): Buffer;
    isBuffer(obj: any): obj is Buffer;
  } | undefined;
}

export {};
