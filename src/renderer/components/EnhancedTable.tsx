import { Button, InputAdornment } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import TextField from "@material-ui/core/TextField";
import AddIcon from "@material-ui/icons/Add";
import SearchIcon from "@material-ui/icons/Search";
import { ipcRenderer } from "electron";
import React, { useEffect } from "react";

interface Data {
  id: number;
  name: string;
}

function createData(files: string[]): Data[] {
  const data: Data[] = Array();
  for (let i = 0; i < files.length; i++) {
    data.push({ id: i, name: files[i] });
  }
  return data;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = "asc" | "desc";

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  numeric: boolean;
}

const headCells: HeadCell[] = [
  {
    id: "name",
    numeric: false,
    disablePadding: true,
    label: "ファイル名",
  },
];

interface EnhancedTableProps {
  classes: ReturnType<typeof useStyles>;
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Data
  ) => void;
  order: Order;
  orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof Data) => (
    event: React.MouseEvent<unknown>
  ) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
    },
    container: {
      minHeight: 465,
      maxHeight: 465,
    },
    paper: {
      width: "100%",
      marginBottom: theme.spacing(2),
    },
    table: {
      minWidth: 750,
    },
    text: {
      margin: theme.spacing(1),
    },
    visuallyHidden: {
      border: 0,
      clip: "rect(0 0 0 0)",
      height: 1,
      margin: -1,
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      top: 20,
      width: 1,
    },
    button: {
      margin: theme.spacing(1),
    },
  })
);

export default function EnhancedTable() {
  const classes = useStyles();
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<keyof Data>("name");
  const [selected, setSelected] = React.useState<Data[]>([]);
  const [rows, setRows] = React.useState<Data[]>([]);
  const [searchFilterFn, setSearchFilterFn] = React.useState({
    fn: (items: Data[]): Data[] => {
      return items;
    },
  });

  // 最初に１回だけ、ライブラリにあるファイルを読み込む
  useEffect(() => {
    ipcRenderer.invoke("read_library").then((libFiles) => {
      setRows(createData(libFiles));
    });
  }, []);

  const handleRequestSort = (
    event: React.MouseEvent<unknown, MouseEvent>,
    property: keyof Data
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleClick = (event: React.MouseEvent<unknown>, data: Data) => {
    const selectedIndex = selected.indexOf(data);
    let newSelected: Data[] = [];

    // 通常の左クリックの場合は、その行のみが選択されるようにする
    newSelected = [data];

    // if (selectedIndex === -1) {
    //   newSelected = newSelected.concat(selected, data);
    // } else if (selectedIndex === 0) {
    //   newSelected = newSelected.concat(selected.slice(1));
    // } else if (selectedIndex === selected.length - 1) {
    //   newSelected = newSelected.concat(selected.slice(0, -1));
    // } else if (selectedIndex > 0) {
    //   newSelected = newSelected.concat(
    //     selected.slice(0, selectedIndex),
    //     selected.slice(selectedIndex + 1)
    //   );
    // }
    setSelected(newSelected);
  };

  const handleSearch = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ): void => {
    console.log("handleSearch");
    console.log(event.target);
    console.log(event.target.value);
    const value = event.target.value;

    setSearchFilterFn({
      fn: (items: Data[]): Data[] => {
        if (value === "") {
          return items;
        } else {
          return items.filter((x) => x.name.includes(value));
        }
      },
    });
  };

  const handleBtnClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    ipcRenderer.invoke("open_dir_dialog").then((libFiles) => {
      setRows(createData(libFiles));
    });
  };

  const isSelected = (data: Data) => selected.indexOf(data) !== -1;

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <TextField
          className={classes.text}
          id="search"
          label="ファイル名で検索"
          variant="outlined"
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          className={classes.button}
          startIcon={<AddIcon />}
          onClick={handleBtnClick}
        >
          ディレクトリを追加
        </Button>
        <TableContainer className={classes.container}>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size="small"
            aria-label="enhanced table"
            stickyHeader
          >
            <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {stableSort(
                searchFilterFn.fn(rows),
                getComparator(order, orderBy)
              ).map((row, index) => {
                const isItemSelected = isSelected(row);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.name}
                    selected={isItemSelected}
                  >
                    <TableCell component="th" id={labelId} scope="row">
                      {row.name}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <div>{selected.length === 1 ? selected[0].name : ""}</div>
      </Paper>
    </div>
  );
}
