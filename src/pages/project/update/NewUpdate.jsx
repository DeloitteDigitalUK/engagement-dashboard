import React from 'react';

import { useLocation, useHistory } from 'react-router-dom';

import { Paper, makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

import AuthenticatedLayout from "../../../layouts/AuthenticatedLayout";

import updateViews from '../../../components/update';
import StatusMessages from '../../../components/StatusMessages';
import FormDescription from '../../../components/FormDescription';

import { useStatusMessages } from '../../../utils/formHelpers';

import { useAPI } from '../../../api';

const knownErrors = {}

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1, 2, 2, 2)
  }
}));

export default function NewUpdatePage({ user, project }) {

  const history = useHistory();
  const location = useLocation();
  const classes = useStyles();
  const [ messages, setMessages ] = useStatusMessages();

  const api = useAPI();
  
  const queryParams = new URLSearchParams(location.search);
  const updateType = queryParams.get('type');

  const views = updateViews[updateType];
  if(!views) {
    return <Alert severity="error">Update type not found!</Alert>;
  }

  function save(update) {
    api.addUpdate(update);
    history.push(`/project/${project.id}/update/${update.id}`);
  }

  function cancel() {
    history.goBack();
  }

  const UpdateForm = views.addForm;

  return (
    <AuthenticatedLayout user={user} project={project}>
      <Paper className={classes.paper}>
        <StatusMessages messages={messages} />

        <FormDescription title={`Add ${updateType}`}>
          Add a new update to this project.
        </FormDescription>

        <UpdateForm
          user={user}
          project={project}
          update={null}
          save={save}
          cancel={cancel}
          setMessages={setMessages}
          knownErrors={knownErrors}
          />

      </Paper>
    </AuthenticatedLayout>
  );

}