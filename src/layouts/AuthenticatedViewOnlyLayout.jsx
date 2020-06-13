import React from 'react';

import {
  CssBaseline,
  AppBar,
  Container,
  makeStyles,
} from '@material-ui/core';

import AuthenticatedToolbar from '../components/Toolbar';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  appBar: {
    backgroundColor: '#ecb144',
    color: 'black'
  }
}));

export default function AuthenticatedLayout({ user, project, update, editLink, children }) {
  
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={classes.appBar}>
        <AuthenticatedToolbar user={user} update={update} editLink={editLink} />
      </AppBar>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          {children}
        </Container>
      </main>
    </div>
  );
}