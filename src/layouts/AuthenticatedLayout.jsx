import React from 'react';

import { Link as RouterLink } from 'react-router-dom';

import {
  CssBaseline,
  AppBar,
  Toolbar,
  Container,
  Link,
  makeStyles
} from '@material-ui/core';

import UserMenu from '../components/UserMenu';

export const useAuthenticatedStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  title: {
    flexGrow: 1,
    '&:hover': {
      textDecoration: 'none'
    },
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
  alert: {
    width: '100%',
  },
  form: {
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function AuthenticatedLayout({ user, title, titleLink, children }) {
  
  const classes = useAuthenticatedStyles();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Link component={RouterLink} variant="h6" color="inherit" noWrap className={classes.title} to={titleLink? titleLink : "/"}>
            {title? title : "Engagement Dashboard"}
          </Link>
          <UserMenu user={user} />
        </Toolbar>
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