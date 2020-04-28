import React from 'react';

import { Grid } from '@material-ui/core';
import { Formik, Form } from 'formik';

import { UpdateTypes, InsightsUpdate } from 'models';

import { submitHandler } from '../../utils/formHelpers';
import { UpdateFields, UpdateButtons, toInitialValues, toUpdateValues } from './updateHelpers';

function InsightsSummary() {

}

function InsightsView() {

}

function InsightsForm({ user, project, update, save, cancel, setMessages, knownErrors }) {

  const editing = !!update;

  if(!editing) {
    update = new InsightsUpdate(null, {type: UpdateTypes.insights});
  }
  
  return (
      <Formik
          validationSchema={InsightsUpdate.getSchema()}
          initialValues={{
            ...toInitialValues(update),
          }}
          onSubmit={submitHandler({
            action: (data) => {
              update.update({
                ...toUpdateValues(data),
                authorId: user.uid,
                authorName: user.displayName
              });
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
