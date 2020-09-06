import fs from "fs";
import path from "path";

export enum FILE_EVENTS {
  OPEN_DIALOG = "open_dialog",
  SAVE_DIALOG = "save_dialog",
  OPEN_FILE = "open_file",
  SAVE_FILE = "save_file",
  READ_DIR = "read_dir",
}

export const FILE_FILTERS: {
  name: string;
  extensions: string[];
}[] = [
  { name: "Text", extensions: ["txt"] },
  { name: "All Files", extensions: ["*"] },
];

export interface FileInfoType {
  fileName: string;
  fileText: string;
}

export const readFile = (fileName: string): string => {
  let fileText = "";
  try {
    fileText = fs.readFileSync(fileName, "UTF-8");
  } catch (e) {
    console.log(e);
  }
  return fileText;
};

export const saveFile = (fileName: string, fileText: string): void => {
  try {
    fs.writeFileSync(fileName, fileText, "UTF-8");
  } catch (e) {
    console.log(e);
  }
};

export const readdirRecursiveSync = (dir: string): string[] => {
  const _readdirRecursiveSync = (
    root: string,
    pathFromRoot: string
  ): string[] => {
    let dirents: fs.Dirent[] = [];
    try {
      dirents = fs.readdirSync(path.join(root, pathFromRoot), {
        withFileTypes: true,
      });
    } catch (err) {
      console.error(err);
      console.error("root:", root, ", pathFromRoot:", pathFromRoot);
    }

    const files: string[] = dirents.flatMap((dirent) =>
      dirent.isFile()
        ? [path.join(pathFromRoot, dirent.name)]
        : _readdirRecursiveSync(root, path.join(pathFromRoot, dirent.name))
    );
    return files;
  };

  return _readdirRecursiveSync(dir, "");
};

export const copydir = (src: string, dest: string): void => {
  const srcFiles = readdirRecursiveSync(src);
  const srcBasename = path.basename(src);

  try {
    srcFiles.forEach((file: string) => {
      fs.mkdirSync(path.join(dest, srcBasename, path.dirname(file)), {
        recursive: true,
      });
      fs.copyFileSync(path.join(src, file), path.join(dest, srcBasename, file));
    });
  } catch (err) {
    console.error(err);
  }
};
