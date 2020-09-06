import fs from "fs";
import path from "path";

export const readdirRecursiveSync = (dir: string): string[] => {
  const _readdirRecursiveSync = (
    root: string,
    pathFromRoot: string
  ): string[] => {
    const dirents: fs.Dirent[] = fs.readdirSync(path.join(root, pathFromRoot), {
      withFileTypes: true,
    });

    const files: string[] = dirents.flatMap((dirent) =>
      dirent.isFile()
        ? [path.join(pathFromRoot, dirent.name)]
        : _readdirRecursiveSync(root, path.join(pathFromRoot, dirent.name))
    );
    return files;
  };

  return _readdirRecursiveSync(dir, "");
};

export const readdirRecursive = (dir: string): Promise<string[]> => {
  const _readdirRecursive = async (
    root: string,
    pathFromRoot: string
  ): Promise<string[]> => {
    const dirents: fs.Dirent[] = await fs.promises.readdir(
      path.join(root, pathFromRoot),
      {
        withFileTypes: true,
      }
    );

    var files: string[] = [];
    for (const dirent of dirents) {
      if (dirent.isFile()) {
        files.push(path.join(pathFromRoot, dirent.name));
      } else {
        const innerFiles: string[] = await _readdirRecursive(
          root,
          path.join(pathFromRoot, dirent.name)
        );
        files = files.concat(innerFiles);
      }
    }

    return files;
  };

  return new Promise<string[]>((resolve) => {
    resolve(_readdirRecursive(dir, ""));
  });
};

export const copydirSync = (src: string, dest: string): void => {
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
