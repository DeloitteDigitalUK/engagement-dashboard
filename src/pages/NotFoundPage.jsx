import React from 'react';
import { Link as RouterLink } from "react-router-dom";

import { Link, Grid, Typography, makeStyles } from '@material-ui/core';
import ErrorOutlinedIcon from '@material-ui/icons/ErrorOutlined';

import AnonymousLayout from '../layouts/AnonymousLayout';

const useStyles = makeStyles((theme) => ({
  infoText: {
    textAlign: 'center'
  }
}));

export default function NotFoundPage() {

  const styles = useStyles();

  return (
    <AnonymousLayout icon={<ErrorOutlinedIcon />} title="Not found">
      <Grid container spacing={2}>
        <Grid item xs={12} className={styles.infoText}>
          <Typography component="p">
            The page you tried to access cannot be found.
          </Typography>
          <Typography component="p">
            <Link to="/" component={RouterLink}>Return to home page</Link>
          </Typography>
        </Grid>
      </Grid>
   </AnonymousLayout>
  );

}