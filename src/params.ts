export const topDir = `${__dirname}`
  .replace('app.asar', 'app.asar.unpacked')
  .replace('main_process', '.');

export const rMsgDir = `${topDir}/algorithm/Rmessage`
