import React, { useState } from 'react';

import { useHistory } from 'react-router-dom';

import {
  Divider,
  Button,
  Typography,
  makeStyles,
} from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';

import { Roles } from 'models';
import { useAPI } from '../../api';

import AuthenticatedLayout from "../../layouts/AuthenticatedLayout";
import ProjectForm from '../../components/ProjectForm';
import ConfirmationDialog from '../../components/ConfirmationDialog';

const knownErrors = {}

const useStyles = makeStyles((theme) => ({
  divider: {
    margin: theme.spacing(3, 0)
  }
}));

export default function EditProjectPage({ user, project }) {

  const [ deleteConfirmOpen, setDeleteConfirmOpen ] = useState(false);

  const history = useHistory();
  const classes = useStyles();

  const api = useAPI();

  const canDelete = project.hasRole(user.email, Roles.owner);

  const saveProject = async (data) => {
    project.update(data);
    await api.saveProject(project);
    history.push(`/project/${project.id}`);
  };

  const deleteProject = async () => {
    api.deleteProject(project);
    history.push('/');
  };

  return (
    <AuthenticatedLayout user={user} project={project}>
      <ProjectForm
        project={project}
        title="Edit project"
        description="Change the settings for your project"
        buttonLabel="Save"
        action={saveProject}
        knownErrors={knownErrors}
        />

        {canDelete && (
          <>
            <Divider className={classes.divider} />

            <Alert severity="error">
              <AlertTitle>Delete project</AlertTitle>
              <Typography paragraph>
                Delete the project and all its updates. This action cannot be undone!
              </Typography>
              <Button variant="contained" color="secondary" onClick={() => setDeleteConfirmOpen(true)}>Delete</Button>
              
              <ConfirmationDialog
                open={deleteConfirmOpen}
                cancel={() => setDeleteConfirmOpen(false)}
                confirm={deleteProject}
                confirmColor="secondary"
                text="When you delete a project, all users will immediately lose access to it, and all updates will be permanently deleted. This action cannot be undone."
                />

            </Alert>
          </>
        )}
    </AuthenticatedLayout>
  );

}