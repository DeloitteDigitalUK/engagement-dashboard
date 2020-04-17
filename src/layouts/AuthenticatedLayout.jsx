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
  },
  projectTitle: {
    marginLeft: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    borderLeft: `solid white 1px`
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
}));

export default function AuthenticatedLayout({ user, project, children }) {
  
  const classes = useAuthenticatedStyles();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Box className={classes.title}>
            <Link to="/" component={RouterLink} variant="subtitle1" color="inherit" noWrap underline="none">
              Engagement Dashboard
            </Link>
            {project && 
              <Link to={`/project/${project.getId()}`} component={RouterLink} variant="subtitle2" color="inherit" noWrap underline="none" className={classes.projectTitle}>
                {project.name}
              </Link>
            }
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