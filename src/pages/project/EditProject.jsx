import React, { useState } from 'react';

import { useHistory } from 'react-router-dom';

import {
  Divider,
  Button,
  Typography,
  makeStyles,
} from '@material-ui/core';

import { Roles } from 'models';

import { useFirebase } from '../../firebase';

import ProjectForm from '../../components/ProjectForm';
import { Alert, AlertTitle } from '@material-ui/lab';
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

  const firebase = useFirebase();

  const canDelete = project.roles[user.email] === Roles.owner;

  const saveProject = async (data) => {
    project.update(data);
    await firebase.saveProject(project);
    history.push(`/project/${project.getId()}`);
  };

  const deleteProject = async () => {
    await firebase.deleteProject(project)
    history.push('/');
  };

  return (
    <>
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
                />

            </Alert>
          </>
        )}

      </>
  );

}