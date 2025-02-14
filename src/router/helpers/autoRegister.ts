const modules = import.meta.glob([
  '@/views/**/index.{vue,tsx,jsx}',
  '!@/views/**/components/**',
  '!@/views/**/plugins/**'
]);

function handlePages(pages: typeof modules) {
  const views: Record<string, any> = {};
  Object.entries(pages).forEach(([file, module]) => {
    const name = file.replace(/\/src\/views\/|\.\/|_([a-zA-Z]|[0-9])+\/*|\/index\.vue/gi, '').replace(/\//g, '_');
    views[name] = module;
  });
  return views;
}

export const views = handlePages(modules);
