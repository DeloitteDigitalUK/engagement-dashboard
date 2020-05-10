import React, { useState } from 'react';
import moment from 'moment';

import { useHistory } from 'react-router-dom';

import * as Yup from "yup";
import { Formik, Field } from 'formik';
import { TextField  } from 'formik-material-ui';

import {
  Button,
  makeStyles,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  Box,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Dialog,
  LinearProgress,
  TextField as MuiTextField
} from '@material-ui/core';

import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';

import { useAPI } from '../../api';

import AuthenticatedLayout from "../../layouts/AuthenticatedLayout";
import StatusMessages from '../../components/StatusMessages';
import { useStatusMessages, submitHandler } from '../../utils/formHelpers';
import FormDescription from '../../components/FormDescription';
import ConfirmationDialog from '../../components/ConfirmationDialog';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(1, 2, 2, 2)
  },
  cancelButton: {
    marginLeft: theme.spacing(1)
  },
  progress: {
    margin: theme.spacing(2, 0)
  }
}));

const addFormSchema = Yup.object({
  name: Yup.string().label("Token name").required().default("")
});

export default function ManageTokensPage({ user, project }) {

  const history = useHistory();
  const api = useAPI();
  const classes = useStyles();

  const [ messages, setMessages ] = useStatusMessages();

  const [ removeConfirm, setRemoveConfirm ] = useState(null);
  const [ addDialogOpen, setAddDialogOpen ] = useState(false);
  const [ newToken, setNewToken ] = useState(null);

  async function addToken(name) {
    const token = await api.createToken(project, name);
    setNewToken(token);
  }

  async function removeToken(uid) {
    await api.removeToken(project, uid);
    setRemoveConfirm(null);
  }

  function closeAddDialog() {
    setAddDialogOpen(false);
    setNewToken(null);
  }

  return (
    <AuthenticatedLayout user={user} project={project}>

      <Paper className={classes.paper}>
        <StatusMessages messages={messages} />

        <FormDescription title="Manage access tokens">
          Access tokens are unique keys that can be used to allow an external
          tool or service to push updates to the dashbaord. Tokens are specific
          to individual projects. Here, you can create or revoke access tokens
          as required for external systems.
        </FormDescription>

        {project.tokens && project.tokens.length > 0 &&
        <Grid container>
          <Grid item xs={12} md={6}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Issued on</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {project.tokens.map(t => (
                  <TableRow key={t.uid}>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>{moment(t.creationDate).format('DD MMM YYYY')}</TableCell>
                    <TableCell>
                      <Button variant="text" color="secondary" onClick={() => { setRemoveConfirm(t.uid) }}>Revoke</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
        }

        <Box my={2}>
          <Button
            type="button"
            color="primary"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => { setAddDialogOpen(true); }}
          >
            New token
          </Button>
        </Box>
        <Box>
          <Button
            type="button"
            variant="text"
            color="inherit"
            underlined="always"
            onClick={() => { history.push(`/project/${project.id}`); }}
          >
            Return to project
          </Button>
        </Box>

      </Paper>

      <ConfirmationDialog
        open={removeConfirm !== null}
        cancel={() => setRemoveConfirm(null)}
        confirm={() => removeToken(removeConfirm)}
        confirmColor="secondary"
        text="When a token is removed, services that use it will stop working until they are issued with a new token."
        />
      
      <Formik
        validationSchema={addFormSchema}
        initialValues={addFormSchema.default()}
        onSubmit={submitHandler({
          action: async (data) => addToken(data.name),
          knownErrors: {},
          setMessages,
        })}
      >
        {({ handleSubmit, isSubmitting }) => (
          <Dialog
            open={addDialogOpen}
            onClose={() => { closeAddDialog(); }}
            disableBackdropClick
            disableEscapeKeyDown
            aria-labelledby="token-create-title"
            aria-describedby="token-create-description"
          >
            <DialogTitle id="token-create-title">
              Create new token
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="token-create-description">
                {newToken?
                  <>
                    Your new token is displayed below. Please copy it. It will
                    not be shown again. If you lose your token, you can revoke
                    it and then create a new one.
                  </>
                :
                  <>
                    Provide enter a memorable name for your token.
                  </>
                }
              </DialogContentText>
              {newToken?
                <MuiTextField
                  disabled
                  autoFocus
                  fullWidth
                  label="Token"
                  variant="outlined"
                  multiline
                  rows={18}
                  value={newToken}
                />
              :
                isSubmitting?
                  <LinearProgress className={classes.progress} />
                :
                  <Field
                    component={TextField}
                    id="name"
                    name="name"
                    label="Token name"
                    fullWidth
                    required
                  />
              }
            </DialogContent>
            <DialogActions>
              {newToken?
                <Button onClick={() => { closeAddDialog(); }} color="default">
                  Close
                </Button>
              :
                <>
                  <Button disabled={isSubmitting} onClick={() => { closeAddDialog(); }} color="default">
                    Cancel
                  </Button>
                  <Button disabled={isSubmitting} onClick={handleSubmit} color="primary">
                    Create
                  </Button>
                </>
              }
              
            </DialogActions>
          </Dialog>
        )}
      </Formik>

    </AuthenticatedLayout>
  );

}