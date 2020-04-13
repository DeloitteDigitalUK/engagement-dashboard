import React from 'react';
import { Link as RouterLink } from "react-router-dom";

import { Link, Grid } from '@material-ui/core';
import ErrorOutlinedIcon from '@material-ui/icons/ErrorOutlined';

import AnonymousLayout from '../layouts/AnonymousLayout';

export default function NotFoundPage() {

  return (
    <AnonymousLayout icon={<ErrorOutlinedIcon />} title="Not found">
      <Grid container spacing={2}>
        <Grid item xs={12}>
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