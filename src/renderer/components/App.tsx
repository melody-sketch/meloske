import { Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React from 'react';
import LibraryManager from './LibraryManager';

const useStyles = makeStyles({
  container: {
    width: '100%',
    height: '560px',
  },
});

export default function App(): JSX.Element {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Container className={classes.container}>
        <LibraryManager />
      </Container>
    </React.Fragment>
  );
}
