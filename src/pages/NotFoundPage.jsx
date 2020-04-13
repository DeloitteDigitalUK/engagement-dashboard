import React from 'react';
import { Link as RouterLink } from "react-router-dom";

import { Link, Grid, makeStyles } from '@material-ui/core';
import ErrorOutlinedIcon from '@material-ui/icons/ErrorOutlined';

import AnonymousLayout from '../layouts/AnonymousLayout';

const useStyles = makeStyles((theme) => ({
  infoText: {
    'text-align': 'center'
  }
}));

export default function NotFoundPage() {

  const styles = useStyles();

  return (
    <AnonymousLayout icon={<ErrorOutlinedIcon />} title="Not found">
      <Grid container spacing={2}>
        <Grid item xs={12} className={styles.infoText}>
          <p>
            The page you tried to access cannot be found.
          </p>
          <p>
            <Link to="/" component={RouterLink}>Return to home page</Link>
          </p>
        </Grid>
      </Grid>
   </AnonymousLayout>
  );

}