import React from 'react';
import { Typography } from '@material-ui/core';

export default function ViewProjectPage({ project }) {
  return (
    <>
      <Typography component="h2" variant="h2" gutterBottom>{project.name}</Typography>
      <Typography paragraph>{project.description}</Typography>
    </>
  );
}