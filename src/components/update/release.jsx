import React from 'react';
import moment from 'moment';
import MomentUtils from '@date-io/moment';

import { Grid, FormControl, FormHelperText, Box, InputLabel, MenuItem } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Select } from 'formik-material-ui';
import { KeyboardDatePicker } from 'formik-material-ui-pickers';

import Markdown from 'react-markdown';

import { UpdateTypes, ReleaseUpdate } from 'models';

import WysiwygEditor from '../../components/WysiwygEditor';
import { submitHandler } from '../../utils/formHelpers';
import {
  UpdateSummary,
  UpdateHeader,
  UpdateFields,
  UpdateButtons,
  toInitialValues,
  toUpdateValues,
  useStyles
} from './updateHelpers';

const releaseStatuses = {
  'in-progress': "in progress",
  'complete': "complete",
  'overdue': "overdue"
};

function ReleaseSummary({ update }) {
  return <UpdateSummary update={update} />;
}

function ReleaseView({ update }) {
  const classes = useStyles();

  return (<>
    <UpdateHeader update={update} />
    <Box className={classes.content}>
      <Markdown source={update.text} />
    </Box>
  </>);
}

function ReleaseForm({ user, project, update, save, cancel, setMessages, knownErrors }) {
  const classes = useStyles();
  
  const editing = !!update;

  if(!editing) {
    update = new ReleaseUpdate(null, {
      date: new Date(),
      status: 'in-progress'
    }, project);
  }

  return (
      <Formik
          validationSchema={ReleaseUpdate.getSchema()}
          initialValues={toInitialValues(update)}
          onSubmit={submitHandler({
            action: async (data) => {
              update.update(toUpdateValues(data));
              update.summary = update.releaseDate?
                `Release on ${moment(update.releaseDate).format("MM/DD/YYYY")} is ${releaseStatuses[update.status]}.` :
                `Release is ${releaseStatuses[update.status]}.`;
              await save(update);
            },
            knownErrors,
            setMessages,
          })}
      >
        {({ handleSubmit, isSubmitting }) => (
          <Form onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2} direction="column">

              <UpdateFields project={project} hideSummary hideDate />

              <Grid item xs={12} md={2}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                  <Field
                    className={classes.lightField}
                    component={KeyboardDatePicker}
                    id="releaseDate"
                    name="releaseDate"
                    label="Release date"
                    disableToolbar
                    fullWidth
                    variant="inline"
                    format="DD/MM/YYYY"
                    />
                </MuiPickersUtilsProvider>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth className={classes.lightField}>
                  <InputLabel htmlFor="status">Status</InputLabel>
                  <Field
                    component={Select}
                    id="status"
                    name="status"
                  >
                    <MenuItem value="in-progress">In progress</MenuItem>
                    <MenuItem value="complete">Complete</MenuItem>
                    <MenuItem value="overdue">Overdue</MenuItem>
                  </Field>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Field
                    name="text"
                    component={WysiwygEditor}
                    />
                  <FormHelperText variant="outlined" error><ErrorMessage name="text" /></FormHelperText>
                </FormControl>
              </Grid>

              <UpdateButtons editing={editing} isSubmitting={isSubmitting} cancel={cancel} />

            </Grid>
          </Form>
        )}
      </Formik>
  );
}

export default {
  updateType: UpdateTypes.release,
  SummaryView: ReleaseSummary,
  FullView: ReleaseView,
  AddForm: ReleaseForm,
  EditForm: ReleaseForm,
};
