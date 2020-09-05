import { app, App, BrowserWindow, dialog, ipcMain } from "electron";
import Store from "electron-store";
import fs from "fs";
import {
  copydir,
  FileInfoType,
  FILE_EVENTS,
  FILE_FILTERS,
  readdirRecursive,
  readFile,
  saveFile,
} from "./fileIO";

const DEFAULT_LIBRARY_DIR: string = "./library";

class SampleApp {
  private mainWindow: BrowserWindow | null = null;
  private app: App;
  private mainURL: string = `file://${__dirname}/scripts/index.html`;
  private libraryDir: string;

  constructor(app: App) {
    this.app = app;
    this.app.on("window-all-closed", this.onWindowAllClosed.bind(this));
    this.app.on("ready", this.create.bind(this));
    this.app.on("activate", this.onActivated.bind(this));

    type StoreType = {
      libraryDir: string;
    };
    const store = new Store<StoreType>({
      defaults: {
        libraryDir: DEFAULT_LIBRARY_DIR,
      },
    });

    this.libraryDir = store.get("libraryDir");
    if (!fs.existsSync(this.libraryDir)) {
      fs.mkdirSync(this.libraryDir);
      console.log("make library dir", this.libraryDir);
    }

    // ファイルを開く
    ipcMain.on(FILE_EVENTS.OPEN_DIALOG, () => {
      if (this.mainWindow === null) return;
      const fileNames: string[] | undefined = dialog.showOpenDialogSync(
        this.mainWindow,
        {
          properties: ["openFile"],
          filters: FILE_FILTERS,
        }
      );
      if (!fileNames || !fileNames.length) return;
      const fileText = readFile(fileNames[0]);
      //レンダラープロセスへ送信
      this.mainWindow.webContents.send(FILE_EVENTS.OPEN_FILE, {
        fileName: fileNames[0],
        fileText,
      });
    });

    // 名前をつけて保存する
    ipcMain.on(FILE_EVENTS.SAVE_DIALOG, (_, fileInfo: FileInfoType) => {
      if (this.mainWindow === null) return;
      const newFileName: string | undefined = dialog.showSaveDialogSync(
        this.mainWindow,
        {
          defaultPath: fileInfo.fileName,
          filters: FILE_FILTERS,
        }
      );
      if (!newFileName) return;
      saveFile(newFileName, fileInfo.fileText);
      //レンダラープロセスへ送信
      this.mainWindow.webContents.send(FILE_EVENTS.SAVE_FILE, newFileName);
    });

    ipcMain.on(FILE_EVENTS.READ_DIR, (_) => {
      if (this.mainWindow === null) return;
      const libFiles = readdirRecursive(this.libraryDir);
      this.mainWindow.webContents.send(FILE_EVENTS.READ_DIR, libFiles);
    });

    ipcMain.on("open_dir_dialog", (_) => {
      if (this.mainWindow === null) return;

      const dirs: string[] | undefined = dialog.showOpenDialogSync(
        this.mainWindow,
        {
          title: "ディレクトリを追加",
          properties: ["openDirectory"],
        }
      );

      if (dirs === undefined) return;

      copydir(dirs[0], this.libraryDir);
      console.log("open_dir_dialog:", dirs);
      const libFiles = readdirRecursive(this.libraryDir);
      this.mainWindow.webContents.send("add_dir_to_library", libFiles);
    });
  }

  private onWindowAllClosed() {
    this.app.quit();
  }

  private create() {
    this.mainWindow = new BrowserWindow({
      width: 700,
      height: 750,
      minWidth: 500,
      minHeight: 750,
      acceptFirstMouse: true,
      webPreferences: {
        nodeIntegration: true,
      },
    });

    console.log("index.html path:", this.mainURL);
    console.log("library dir path:", this.libraryDir);

    this.mainWindow.loadURL(this.mainURL);

    this.mainWindow.webContents.openDevTools();

    this.mainWindow.webContents.on("did-finish-load", () => {
      const libFiles = readdirRecursive(this.libraryDir);
      console.log("lib files:", libFiles);
      this.mainWindow!.webContents.send(FILE_EVENTS.READ_DIR, libFiles);
    });

    this.mainWindow.on("closed", () => {
      this.mainWindow = null;
    });
  }

  private onReady() {
    this.create();
  }

  private onActivated() {
    if (this.mainWindow === null) {
      this.create();
    }
  }
}

const MyApp: SampleApp = new SampleApp(app);
