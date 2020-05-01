import React from 'react';

import { Alert } from '@material-ui/lab';

import { Roles } from 'models';

import AuthenticatedLayout from "../../../layouts/AuthenticatedLayout";
import updateViews from '../../../components/update';

export default function ViewUpdatePage({ user, project, update }) {

  const views = updateViews[update.type];
  if(!views) {
    return <Alert severity="error">Update type not found!</Alert>;
  }

  const canEdit = project.hasRole(user.email, [Roles.owner, Roles.administrator, Roles.author]);
  const editLink = `/project/${project.id}/update/${update.id}/edit`;

  const UpdateView = views.FullView;

  return (
    <AuthenticatedLayout user={user} project={project} update={update} editLink={canEdit? editLink: null}>
      <UpdateView user={user} project={project} update={update} />
    </AuthenticatedLayout>
  );

}