import React from 'react';

import { Box } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import { useAuthenticatedStyles } from '../layouts/AuthenticatedLayout';

export default function StatusMessages({ status, error }) {

  const classes = useAuthenticatedStyles();

  return (
    <Box my={2}>
      {error && <Alert className={classes.alert} severity="error">{error}</Alert>}
      {status && <Alert className={classes.alert} severity="success">{status}</Alert>}
    </Box>
  );
}