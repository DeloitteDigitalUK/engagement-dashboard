import React from 'react';
import { Box, Typography } from '@material-ui/core';

export default function FormDescription({ title, children, component="h2", variant="h5" }) {
  return (
    <Box my={2}>
      <Typography component={component} variant={variant} gutterBottom>{title}</Typography>
      {typeof children === "string"? <Typography paragraph>{children}</Typography> : children}
    </Box>
  );
}