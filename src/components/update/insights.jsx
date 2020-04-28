import React from 'react';

import { Grid, FormControl, FormHelperText } from '@material-ui/core';
import { Formik, Form, Field, ErrorMessage } from 'formik';

import { UpdateTypes, InsightsUpdate } from 'models';

import WysiwygEditor from '../../components/WysiwygEditor';

import { submitHandler } from '../../utils/formHelpers';
import { UpdateFields, UpdateButtons, toInitialValues, toUpdateValues } from './updateHelpers';

function InsightsSummary() {

}

function InsightsView() {

}

function InsightsForm({ user, project, update, save, cancel, setMessages, knownErrors }) {

  const editing = !!update;

  if(!editing) {
    update = new InsightsUpdate(null, {
      type: UpdateTypes.insights,
      authorId: user.uid,
      authorName: user.displayName
    });
  }
  
  return (
      <Formik
          validationSchema={InsightsUpdate.getSchema()}
          initialValues={{
            ...toInitialValues(update),
            text: "Text **here**"
          }}
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
export const summaryCriteria = () => ({
  orderBy: ['date', 'desc'],
  limit: 3,
});
export const summaryView = InsightsSummary;
export const fullView = InsightsView;
export const addForm = InsightsForm;
export const editForm = InsightsForm;
