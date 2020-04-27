import React from 'react';

import { useLocation } from 'react-router-dom';

import { Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import AuthenticatedLayout from "../../../layouts/AuthenticatedLayout";
import updateViews from '../../../components/update';

// import { useAPI } from '../../../api';

// const knownErrors = {}

export default function UpdateUpdatePage({ user, project }) {

  // const history = useHistory();
  const location = useLocation();
  // const api = useAPI();
  
  const queryParams = new URLSearchParams(location.search);
  const updateType = queryParams.get('type');

  const views = updateViews[updateType];
  if(!views) {
    return <Alert severity="error">Update type not found!</Alert>;
  }

  const UpdateForm = views.addForm;

  return (
    <AuthenticatedLayout user={user} project={project}>
      <Typography component="h2" variant="h3" gutterBottom>Add {queryParams.get('type')}</Typography>
      <UpdateForm user={user} project={project} />
    </AuthenticatedLayout>
  );

}