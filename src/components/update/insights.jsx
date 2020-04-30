import React from 'react';

import { Grid, FormControl, FormHelperText, Box, makeStyles } from '@material-ui/core';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Markdown from 'react-markdown';

import { UpdateTypes, InsightsUpdate } from 'models';

import WysiwygEditor from '../../components/WysiwygEditor';

import { submitHandler } from '../../utils/formHelpers';
import { UpdateSummary, UpdateHeader, UpdateFields, UpdateButtons, toInitialValues, toUpdateValues } from './updateHelpers';

const useStyles = makeStyles((theme) => ({
  content: {
    ...theme.typography.body1
  }
}));

function InsightsSummary({ update }) {
  return <UpdateSummary update={update} />;
}

function InsightsView({ update }) {
  const classes = useStyles();

  return (
    <>
      <UpdateHeader update={update} />
      <Box className={classes.content}>
        <Markdown source={update.text} />
      </Box>
    </>
  );
}

function InsightsForm({ user, project, update, save, cancel, setMessages, knownErrors }) {

  const editing = !!update;

  if(!editing) {
    update = new InsightsUpdate(null, {
      type: UpdateTypes.insights,
      authorId: user.uid,
      authorName: user.displayName
    }, project);
  }
  
  return (
      <Formik
          validationSchema={InsightsUpdate.getSchema()}
          initialValues={toInitialValues(update)}
          onSubmit={submitHandler({
            action: (data) => {
              update.update(toUpdateValues(data));
              save(update);
            },
            knownErrors,
            setMessages,
          })}
      >
        {({ handleSubmit, isSubmitting }) => (
          <Form onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2} direction="column">

              <UpdateFields project={project} />
              
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

export const updateType = UpdateTypes.insights;
export const summaryView = InsightsSummary;
export const fullView = InsightsView;
export const addForm = InsightsForm;
export const editForm = InsightsForm;
