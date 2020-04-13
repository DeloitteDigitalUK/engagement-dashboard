import React from 'react';
import { Grid, CircularProgress } from '@material-ui/core';

export default () => (
  <Grid
    container
    spacing={0}
    direction="column"
    alignItems="center"
    justify="center"
    style={{ minHeight: '100vh' }}
  >
    <Grid item xs={3}>
      <CircularProgress />
    </Grid>   
</Grid> 
);