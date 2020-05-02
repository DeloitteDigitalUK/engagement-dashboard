import React, { useState } from 'react';

import { useHistory } from 'react-router-dom';

import { Paper, makeStyles, Divider, Typography, Button } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';

import AuthenticatedLayout from "../../../layouts/AuthenticatedLayout";

import updateViews from '../../../components/update';
import StatusMessages from '../../../components/StatusMessages';
import FormDescription from '../../../components/FormDescription';

import { useStatusMessages } from '../../../utils/formHelpers';

import { useAPI } from '../../../api';
import ConfirmationDialog from '../../../components/ConfirmationDialog';

const knownErrors = {}

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1, 2, 2, 2)
  },
  divider: {
    margin: theme.spacing(3, 0)
  }
}));

export default function EditUpdatePage({ user, project, update }) {

  const history = useHistory();
  const classes = useStyles();

  const [ messages, setMessages ] = useStatusMessages();
  const [ deleteConfirmOpen, setDeleteConfirmOpen ] = useState(false);

  const api = useAPI();
  
  const views = updateViews[update.type];
  if(!views) {
    return <Alert severity="error">Update type not found!</Alert>;
  }

  function save(update) {
    api.saveUpdate(update);
    history.push(`/project/${project.id}/update/${update.id}`);
  }

  function cancel() {
    history.goBack();
  }

  const deleteUpdate = async () => {
    api.deleteUpdate(update);
    history.push(`/project/${project.id}`);
  };

  const UpdateForm = views.EditForm

  return (
    <AuthenticatedLayout user={user} project={project} update={update}>
      <Paper className={classes.paper}>
        <StatusMessages messages={messages} />

        <FormDescription title={`Edit ${update.type}`}>
          Modify an existing update.
        </FormDescription>

        <UpdateForm
          user={user}
          project={project}
          update={update}
          save={save}
          cancel={cancel}
          setMessages={setMessages}
          knownErrors={knownErrors}
          />

      </Paper>

      <Divider className={classes.divider} />

      <Alert severity="error">
        <AlertTitle>Delete update</AlertTitle>
        <Typography paragraph>
          This action cannot be done.
        </Typography>
        <Button variant="contained" color="secondary" onClick={() => setDeleteConfirmOpen(true)}>Delete</Button>
        
        <ConfirmationDialog
          open={deleteConfirmOpen}
          cancel={() => setDeleteConfirmOpen(false)}
          confirm={deleteUpdate}
          confirmColor="secondary"
          text="This action cannot be undone."
          />

      </Alert>

    </AuthenticatedLayout>
  );

}