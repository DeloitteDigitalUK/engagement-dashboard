import React from 'react';

import { Box } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import { useAuthenticatedStyles } from '../layouts/AuthenticatedLayout';

/**
 * Display status messages as managed by `useStatusMessages()`
 */
export default function StatusMessages({ messages }) {
  const classes = useAuthenticatedStyles();

  return (
    <Box my={2}>
      {messages.error && <Alert className={classes.alert} severity="error">{messages.error}</Alert>}
      {messages.status && <Alert className={classes.alert} severity="success">{messages.status}</Alert>}
    </Box>
  );
}