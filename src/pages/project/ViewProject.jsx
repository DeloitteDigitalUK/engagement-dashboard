import React from 'react';

import { Typography } from '@material-ui/core';
import AuthenticatedLayout from "../../layouts/AuthenticatedLayout";

export default function ViewProjectPage({ user, project }) {
  return (
    <AuthenticatedLayout user={user} project={project}>
      <Typography component="h2" variant="h3" gutterBottom>{project.name}</Typography>
      <Typography paragraph>{project.description}</Typography>
    </AuthenticatedLayout>
  );
}