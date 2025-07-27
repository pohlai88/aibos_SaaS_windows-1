/// <reference types="vitest" />

declare module 'vitest' {
  export const describe: any;
  export const it: any;
  export const expect: any;
  export const beforeEach: any;
  export const afterEach: any;
  export const vi: any;
}

declare module '@tensorflow/tfjs-node' {
  const tf: {
    loadGraphModel: any;
    node: {
      decodeImage: any;
    };
    image: {
      resizeBilinear: any;
    };
    dispose: any;
  };
  export default tf;
}
