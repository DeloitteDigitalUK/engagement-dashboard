import React from 'react';

import { Alert } from '@material-ui/lab';

import AuthenticatedLayout from "../../../layouts/AuthenticatedLayout";

import updateViews from '../../../components/update';

export default function EditUpdatePage({ user, project, update }) {

  const views = updateViews[update.type];
  if(!views) {
    return <Alert severity="error">Update type not found!</Alert>;
  }

  const UpdateView = views.fullView;

  return (
    <AuthenticatedLayout user={user} project={project}>
        <UpdateView user={user} project={project} update={update} />
    </AuthenticatedLayout>
  );

}