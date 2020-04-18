import React from 'react';

import { Box } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

/**
 * Display status messages as managed by `useStatusMessages()`
 */
export default function StatusMessages({ messages }) {
  return (
    <Box my={2}>
      {messages.error && <Alert severity="error">{messages.error}</Alert>}
      {messages.status && <Alert severity="success">{messages.status}</Alert>}
    </Box>
  );
}