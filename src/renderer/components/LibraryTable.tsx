import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import React from "react";
import { LibraryData } from "./LibraryManager";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      height: "100%",
    },
    container: {
      width: "100%",
      height: "100%",
    },
    table: {
      width: "100%",
      height: "100%",
    },
  })
);

interface LibraryTableProps {
  libraryDataList: LibraryData[];
}

export default function LibraryTable(props: LibraryTableProps) {
  const { libraryDataList } = props;
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <TableContainer className={classes.container}>
        <Table
          className={classes.table}
          aria-labelledby="tableTitle"
          size="small"
          aria-label="enhanced table"
          stickyHeader
        >
          <TableBody>
            {libraryDataList.map((row, index) => {
              const labelId = `enhanced-table-checkbox-${index}`;

              return (
                <TableRow hover tabIndex={-1} key={row.name}>
                  <TableCell component="th" id={labelId} scope="row">
                    {row.name}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
