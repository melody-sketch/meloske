import { Container } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import React, { useState } from "react";
import LibraryManager, { LibraryData } from "./LibraryManager";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      width: "100%",
      height: "560px",
    },
  })
);

export default function App() {
  const classes = useStyles();
  const [selectedData, setSelectedData] = useState<LibraryData | undefined>(
    undefined
  );

  console.log("selectedData", selectedData);

  return (
    <Container className={classes.container}>
      <LibraryManager setSelectedData={setSelectedData} />
    </Container>
  );
}
