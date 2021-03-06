import {
  IntegratedFiltering,
  IntegratedSorting,
  SearchState,
  SelectionState,
  SortingState,
} from '@devexpress/dx-react-grid';
import {
  ColumnChooser,
  Grid,
  SearchPanel,
  TableColumnResizing,
  TableColumnVisibility,
  TableHeaderRow,
  TableSelection,
  Toolbar,
  VirtualTable,
} from '@devexpress/dx-react-grid-material-ui';
import { CircularProgress } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { ipcRenderer } from 'electron';
import React, { ReactText, useEffect, useState } from 'react';

export interface LibraryData {
  name: string;
}

function createDataList(files: string[]): Promise<LibraryData[]> {
  return new Promise((resolve) => {
    const data: LibraryData[] = [];
    for (let i = 0; i < files.length; i++) {
      data.push({ name: files[i] });
    }
    resolve(data);
  });
}

interface LibraryManagerProps {
  setSelectedData: React.Dispatch<
    React.SetStateAction<LibraryData | undefined>
  >;
}

// TODO: 返り値の型を定義する
export default function LibraryManager(
  props: LibraryManagerProps
): JSX.Element {
  const { setSelectedData } = props;

  const [columns] = useState([{ name: 'name', title: 'ファイル名' }]);
  const [rows, setRows] = useState<LibraryData[]>([]);
  const [selection, setSelection] = useState<ReactText[]>([]);
  const [defaultColumnWidths] = useState([{ columnName: 'name', width: 300 }]);
  const [defaultHiddenColumnNames] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 最初に１回だけ、ライブラリにあるファイルを読み込む
  useEffect(() => {
    ipcRenderer
      .invoke('read_library')
      .then((libraryFiles) => {
        console.log('useEffect - ipcRenderer.invoke("read_library") =>');
        return createDataList(libraryFiles);
      })
      .then((dataList) => {
        setRows(dataList);
        setLoading(false);
      });
  }, []);

  console.log('selection:', selection);

  useEffect(() => {
    if (selection.length === 1) {
      if (typeof selection[0] == 'number') setSelectedData(rows[selection[0]]);
    } else {
      setSelectedData(undefined);
    }
  }, [rows, selection, setSelectedData]);

  return (
    <Paper>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid rows={rows} columns={columns}>
          <SelectionState
            selection={selection}
            onSelectionChange={setSelection}
          />
          <SearchState defaultValue="" />
          <IntegratedFiltering />
          <SortingState
            defaultSorting={[{ columnName: 'name', direction: 'asc' }]}
          />
          <IntegratedSorting />
          <VirtualTable />
          <TableColumnResizing defaultColumnWidths={defaultColumnWidths} />
          <TableHeaderRow showSortingControls />
          <TableSelection selectByRowClick />
          <TableColumnVisibility
            defaultHiddenColumnNames={defaultHiddenColumnNames}
          />
          <Toolbar />
          <SearchPanel />
          <ColumnChooser />
        </Grid>
      )}
    </Paper>
  );
}
