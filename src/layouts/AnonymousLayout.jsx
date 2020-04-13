import React from 'react';

import { Avatar, Typography, Paper, CssBaseline, Box, Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

export const useAnonymousStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  alert: {
    width: '100%',
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function AnonymousLayout({ icon, title, children }) {

  const classes = useAnonymousStyles();

  return (
    <Container maxWidth="sm">
      <CssBaseline />
      <Box my={4}>
        <Paper className={classes.paper}>
          <Avatar className={classes.avatar}>
            {icon}
          </Avatar>
          <Typography component="h1" variant="h5">
            {title}
          </Typography>
          {children}
        </Paper>
      </Box>
    </Container>
  );
}