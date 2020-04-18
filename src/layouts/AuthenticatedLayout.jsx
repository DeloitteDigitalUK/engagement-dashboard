import React from 'react';

import { Link as RouterLink } from 'react-router-dom';

import {
  CssBaseline,
  AppBar,
  Toolbar,
  Container,
  Link,
  makeStyles,
  Box,
} from '@material-ui/core';

import UserMenu from '../components/UserMenu';
import ProjectMenu from '../components/ProjectMenu';

const useStyles = makeStyles((theme) => ({
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
}));

export default function AuthenticatedLayout({ user, project, children }) {
  
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Box className={classes.title}>
            <Link to="/" component={RouterLink} variant="subtitle1" color="inherit" noWrap underline="none">
              Engagement Dashboard
            </Link>
            {project && <ProjectMenu user={user} project={project} />}
          </Box>
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