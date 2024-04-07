import ViteCompression from 'vite-plugin-compression';

export default (viteEnv: ImportMetaEnv) => {
  const { VITE_COMPRESS, VITE_COMPRESS_TYPE = 'gzip' } = viteEnv;
  return ViteCompression({
    disable: VITE_COMPRESS === 'N',
    algorithm: VITE_COMPRESS_TYPE
  });
};
