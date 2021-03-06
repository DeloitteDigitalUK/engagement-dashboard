import React from 'react';

import { Grid, FormControl, FormHelperText, Box } from '@material-ui/core';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Markdown from 'react-markdown';

import { UpdateTypes, InsightsUpdate } from 'models';

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

function InsightsSummary({ update }) {
  return <UpdateSummary update={update} />;
}

function InsightsView({ update }) {
  return (<>
    <UpdateHeader update={update} />
    <InsightsContent update={update} />
  </>);
}

function InsightsContent({ update }) {
  const classes = useStyles();

  return (<>
    <Box className={classes.content}>
      <Markdown source={update.text} />
    </Box>
  </>);
}

function InsightsForm({ user, project, update, save, cancel, setMessages, knownErrors }) {

  const editing = !!update;

  if(!editing) {
    update = new InsightsUpdate(null, {
      date: new Date(),
      authorId: user.uid,
      authorName: user.displayName
    }, project);
  }
  
  return (
      <Formik
          validationSchema={InsightsUpdate.getSchema()}
          initialValues={toInitialValues(update)}
          onSubmit={submitHandler({
            action: async (data) => {
              update.update(toUpdateValues(data));
              await save(update);
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

export default {
  updateType: UpdateTypes.insights,
  title: "insight",
  SummaryView: InsightsSummary,
  FullView: InsightsView,
  ContentView: InsightsContent,
  AddForm: InsightsForm,
  EditForm: InsightsForm,
};
