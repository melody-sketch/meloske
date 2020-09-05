import { app, BrowserWindow, dialog, ipcMain } from "electron";
import Store from "electron-store";
import { copydir, FILE_EVENTS, readdirRecursive } from "./fileIO";

const DEFAULT_LIBRARY_DIR: string = "./library";
const HTML_PATH: string = `file://${__dirname}/scripts/index.html`;

type StoreType = {
  libraryDir: string;
};

const store = new Store<StoreType>({
  defaults: {
    libraryDir: DEFAULT_LIBRARY_DIR,
  },
});

const libraryDir = store.get("libraryDir");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // index.html を開く
  console.log("index.html Path:", HTML_PATH);
  win.loadURL(HTML_PATH);

  // 検証ツールを開く
  win.webContents.openDevTools();

  win.webContents.on("did-finish-load", () => {
    const libFiles = readdirRecursive(libraryDir);
    console.log("lib files:", libFiles);
    win!.webContents.send(FILE_EVENTS.READ_DIR, libFiles);
  });

  ipcMain.on(FILE_EVENTS.READ_DIR, (_) => {
    if (win === null) return;
    const libFiles = readdirRecursive(libraryDir);
    win.webContents.send(FILE_EVENTS.READ_DIR, libFiles);
  });

  ipcMain.on("open_dir_dialog", (_) => {
    if (win === null) return;

    const dirs: string[] | undefined = dialog.showOpenDialogSync(win, {
      title: "ディレクトリを追加",
      properties: ["openDirectory"],
    });

    if (dirs === undefined) return;

    copydir(dirs[0], libraryDir);
    console.log("open_dir_dialog:", dirs);
    const libFiles = readdirRecursive(libraryDir);
    win.webContents.send("add_dir_to_library", libFiles);
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
