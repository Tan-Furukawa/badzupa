import { ChildProcess } from 'child_process';
import { app, BrowserWindow } from 'electron';
import path from 'path';
// セキュアな Electron の構成
// 参考: https://qiita.com/pochman/items/64b34e9827866664d436
app.disableHardwareAcceleration();

const createWindow = (): void => {
  // レンダープロセスとなる、ウィンドウオブジェクトを作成する。
  const win = new BrowserWindow({
    width: 800,
    height: 650,
    webPreferences: {
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      contextIsolation: true,
      preload: path.join(__dirname, './core/preLoad.js'),
    },
  });
  console.log(__dirname);

  // 読み込む index.html。
  // tsc でコンパイルするので、出力先の dist の相対パスで指定する。
  win.loadURL('file://' + __dirname + '/index.html');
  // win.loadFile('./index.html');

  // 開発者ツールを起動する
  // win.webContents.openDevTools();
};

// Electronの起動準備が終わったら、ウィンドウを作成する。
app.whenReady().then(createWindow);

// すべての ウィンドウ が閉じたときの処理
app.on('window-all-closed', () => {
  // macOS 以外では、メインプロセスを停止する
  // macOS では、ウインドウが閉じてもメインプロセスは停止せず
  // ドックから再度ウインドウが表示されるようにする。
  // app.relaunch();
  // app.quit();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // macOS では、ウインドウが閉じてもメインプロセスは停止せず
  // ドックから再度ウインドウが表示されるようにする。
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
