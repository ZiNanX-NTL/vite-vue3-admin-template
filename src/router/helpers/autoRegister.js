const modules = import.meta.glob(['@/views/**/index.{vue,tsx,jsx}', '!@/views/**/components/**']);

function handlePages(pages) {
  const views = {};
  Object.entries(pages).forEach(([file, module]) => {
    const name = file.replace(/\/src\/views\/|\.\/|_([a-zA-Z]|[0-9])+\/*|\/index\.vue/gi, '').replace(/\//g, '_');
    views[name] = module;
  });
  return views;
}

export const views = handlePages(modules);
