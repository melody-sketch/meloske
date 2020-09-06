import { Container } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import React from "react";
import LibraryManager from "./LibraryManager";

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

  return (
    <Container className={classes.container}>
      <LibraryManager />
    </Container>
  );
}
