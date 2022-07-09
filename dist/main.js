"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
// セキュアな Electron の構成
// 参考: https://qiita.com/pochman/items/64b34e9827866664d436
const createWindow = () => {
    // レンダープロセスとなる、ウィンドウオブジェクトを作成する。
    const win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            nodeIntegrationInWorker: false,
            contextIsolation: true,
            preload: path_1.default.join(__dirname, './core/preLoad.js'),
        },
    });
    console.log(__dirname);
    // 読み込む index.html。
    // tsc でコンパイルするので、出力先の dist の相対パスで指定する。
    win.loadURL('file://' + __dirname + '/index.html');
    // win.loadFile('./index.html');
    // 開発者ツールを起動する
    win.webContents.openDevTools();
};
// Electronの起動準備が終わったら、ウィンドウを作成する。
electron_1.app.whenReady().then(createWindow);
// すべての ウィンドウ が閉じたときの処理
electron_1.app.on('window-all-closed', () => {
    // macOS 以外では、メインプロセスを停止する
    // macOS では、ウインドウが閉じてもメインプロセスは停止せず
    // ドックから再度ウインドウが表示されるようにする。
    // app.relaunch();
    // app.quit();
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    // macOS では、ウインドウが閉じてもメインプロセスは停止せず
    // ドックから再度ウインドウが表示されるようにする。
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
//# sourceMappingURL=main.js.map