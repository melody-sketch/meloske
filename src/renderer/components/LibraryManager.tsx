import { CircularProgress } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { ipcRenderer } from "electron";
import React, { useEffect } from "react";
import LibraryTable from "./LibraryTable";

export interface LibraryData {
  id: number;
  name: string;
}

function createDataList(files: string[]): Promise<LibraryData[]> {
  return new Promise((resolve) => {
    const data: LibraryData[] = [];
    for (let i = 0; i < files.length; i++) {
      data.push({ id: i, name: files[i] });
    }
    resolve(data);
  });
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      height: "100%",
    },
    paper: {
      width: "100%",
      height: "100%",
    },
  })
);

export default function LibraryManager() {
  const classes = useStyles();

  const [loading, setLoading] = React.useState<boolean>(true);
  const [libraryDataList, setLibraryDataList] = React.useState<LibraryData[]>(
    []
  );

  // 最初に１回だけ、ライブラリにあるファイルを読み込む
  useEffect(() => {
    ipcRenderer
      .invoke("read_library")
      .then((libFiles) => {
        console.log('useEffect - ipcRenderer.invoke("read_library") =>');
        return createDataList(libFiles);
      })
      .then((dataList) => {
        setLibraryDataList(dataList);
        setLoading(false);
      });
  }, []);

  return (
    <div className={classes.root}>
      <Paper className={classes.paper} variant="outlined">
        {loading ? (
          <CircularProgress />
        ) : (
          <LibraryTable libraryDataList={libraryDataList} />
        )}
      </Paper>
    </div>
  );
}
