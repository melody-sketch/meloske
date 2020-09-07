import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import Store from 'electron-store';
import fs from 'fs';
import { copydirSync, readdirRecursive, readdirRecursiveSync } from './fileIO';

const DEFAULT_LIBRARY_DIR = './library';
const HTML_PATH = `file://${__dirname}/scripts/index.html`;

type StoreType = {
  libraryDir: string;
};

const store = new Store<StoreType>({
  defaults: {
    libraryDir: DEFAULT_LIBRARY_DIR,
  },
});

const libraryDir = store.get('libraryDir');
if (!fs.existsSync(libraryDir)) {
  fs.mkdirSync(libraryDir);
  console.log('make library dir', libraryDir);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // index.html を開く
  console.log('index.html Path:', HTML_PATH);
  win.loadURL(HTML_PATH);

  // 検証ツールを開く
  win.webContents.openDevTools();

  ipcMain.handle('read_library', async () => {
    const libFiles = await readdirRecursive(libraryDir);
    return libFiles;
  });

  ipcMain.handle('open_dir_dialog', async () => {
    const dirs: string[] | undefined = dialog.showOpenDialogSync(win, {
      title: 'ディレクトリを追加',
      properties: ['openDirectory'],
    });

    if (dirs === undefined) return undefined;

    copydirSync(dirs[0], libraryDir);
    console.log('open_dir_dialog:', dirs);
    return readdirRecursiveSync(libraryDir);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
