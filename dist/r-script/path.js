export const rScriptModulePath = `${__dirname}`
  .replace('app.asar', 'app.asar.unpacked')
  .replace('main_process', '.');
